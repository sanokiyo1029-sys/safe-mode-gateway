// Safe-Mode Gateway core: every tool call is classified, checked against the operator's
// policy, paused for a human when the policy says "ask", run against a sandboxed workspace
// folder, made undoable where the action allows it, and written to an append-only log.
import { randomUUID } from "node:crypto";
import { appendFile, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

export const CLASSES = ["read", "write", "destructive"];
export const MODES = ["run", "ask", "block"];
export const DECISION_TIMEOUT_MS = 15 * 60 * 1000;

export const TOOLS = {
  search_files: { cls: "read", description: "Search file names and contents in the workspace.", params: { query: 200 } },
  read_file: { cls: "read", description: "Read a text file from the workspace.", params: { path: 300 } },
  list_folder: { cls: "read", description: "List the files in a workspace folder ('.' for the top).", params: { path: 300 } },
  write_file: { cls: "write", description: "Create or overwrite a text file in the workspace.", params: { path: 300, content: 100_000 } },
  rename_file: { cls: "write", description: "Rename or move a file or folder in the workspace.", params: { from: 300, to: 300 } },
  delete_folder: { cls: "destructive", description: "Delete a folder or file and everything in it.", params: { path: 300 } },
};

// Anything the policy does not know is treated as the riskiest class.
export const classify = (tool) => TOOLS[tool]?.cls ?? "destructive";

export class Denied extends Error {}

const checkArgs = (tool, args) => {
  const spec = TOOLS[tool];
  if (!spec) throw new Error(`Unknown tool: ${tool}`);
  const clean = {};
  for (const [name, max] of Object.entries(spec.params)) {
    const v = args?.[name];
    if (typeof v !== "string") throw new Error(`${tool} needs "${name}" as text`);
    if (v.length > max) throw new Error(`"${name}" is longer than ${max} characters`);
    if (name !== "content" && !v.trim()) throw new Error(`"${name}" is empty`);
    clean[name] = v;
  }
  return clean;
};

export function createGateway({ root, template, dataDir, onChange = () => {} }) {
  root = resolve(root);
  const snapshots = join(dataDir, "snapshots");
  const logFile = join(dataDir, "activity.jsonl");
  const state = { policy: { read: "run", write: "ask", destructive: "ask" }, calls: [], log: [], chat: [] };
  const waiting = new Map(); // call id -> { resolve, timer }

  const inside = (p) => {
    const full = resolve(root, String(p).replace(/^[/\\]+/, ""));
    if (full !== root && !full.startsWith(root + sep)) throw new Error(`${p} is outside the workspace`);
    return full;
  };
  const rel = (full) => relative(root, full).split(sep).join("/") || ".";

  const walk = async (dir) => {
    const out = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      out.push({ full, dir: e.isDirectory() });
      if (e.isDirectory()) out.push(...(await walk(full)));
    }
    return out;
  };

  const record = async (entry) => {
    const line = { ts: new Date().toISOString(), ...entry };
    state.log.push(line);
    if (state.log.length > 500) state.log.shift();
    await appendFile(logFile, `${JSON.stringify(line)}\n`);
    onChange();
  };

  const preview = async (tool, args) => {
    try {
      if (tool === "delete_folder") {
        const full = inside(args.path);
        const s = await stat(full);
        return s.isDirectory() ? { items: (await walk(full)).filter((e) => !e.dir).length } : { items: 1 };
      }
      if (tool === "write_file") return { exists: existsSync(inside(args.path)), bytes: Buffer.byteLength(args.content) };
      if (tool === "rename_file") return { exists: existsSync(inside(args.from)) };
    } catch {
      return null;
    }
    return null;
  };

  const execute = async (tool, args, id) => {
    if (tool === "search_files") {
      const q = args.query.toLowerCase();
      const hits = [];
      for (const e of await walk(root)) {
        if (e.dir) continue;
        const name = rel(e.full);
        const text = (await readFile(e.full, "utf8").catch(() => "")).slice(0, 200_000);
        const line = text.split(/\r?\n/).find((l) => l.toLowerCase().includes(q));
        if (name.toLowerCase().includes(q) || line) hits.push(line ? `${name}: "${line.trim().slice(0, 80)}"` : name);
      }
      return { text: hits.length ? `${hits.length} result${hits.length > 1 ? "s" : ""}\n${hits.slice(0, 20).join("\n")}` : `No files match "${args.query}"` };
    }
    if (tool === "read_file") {
      const full = inside(args.path);
      if ((await stat(full)).isDirectory()) throw new Error(`${args.path} is a folder`);
      const text = await readFile(full, "utf8");
      return { text: text.length > 8000 ? `${text.slice(0, 8000)}\n… (truncated)` : text };
    }
    if (tool === "list_folder") {
      const full = inside(args.path);
      const entries = await readdir(full, { withFileTypes: true });
      return { text: entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).join("\n") || "(empty folder)" };
    }
    if (tool === "write_file") {
      const full = inside(args.path);
      if (existsSync(full) && (await stat(full)).isDirectory()) throw new Error(`${args.path} is a folder`);
      const existed = existsSync(full);
      if (existed) {
        await mkdir(join(snapshots, id), { recursive: true });
        await cp(full, join(snapshots, id, "previous"));
      }
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, args.content);
      return { text: `${existed ? "Updated" : "Created"} ${rel(full)}`, undo: { kind: "file", path: rel(full), existed } };
    }
    if (tool === "rename_file") {
      const from = inside(args.from);
      const to = inside(args.to);
      if (!existsSync(from)) throw new Error(`${args.from} does not exist`);
      if (existsSync(to)) throw new Error(`${args.to} already exists`);
      await mkdir(dirname(to), { recursive: true });
      await rename(from, to);
      return { text: `Renamed ${rel(from)} to ${rel(to)}`, undo: { kind: "rename", from: rel(to), to: rel(from) } };
    }
    if (tool === "delete_folder") {
      const full = inside(args.path);
      if (full === root) throw new Error("The workspace itself cannot be deleted");
      if (!existsSync(full)) throw new Error(`${args.path} does not exist`);
      await mkdir(join(snapshots, id), { recursive: true });
      await cp(full, join(snapshots, id, "tree"), { recursive: true });
      await rm(full, { recursive: true, force: true });
      return { text: `Deleted ${rel(full)}`, undo: { kind: "tree", path: rel(full) } };
    }
    throw new Error(`Unknown tool: ${tool}`);
  };

  const waitForDecision = (c) =>
    new Promise((done) => {
      const timer = setTimeout(() => {
        waiting.delete(c.id);
        done({ decision: "timeout", by: "gateway", via: "timeout" });
      }, DECISION_TIMEOUT_MS);
      waiting.set(c.id, { resolve: done, timer });
    });

  async function call({ tool, args = {}, agent = "mcp-agent", via = "mcp" }) {
    const cls = classify(tool);
    const c = { id: randomUUID().slice(0, 8), tool, args, cls, agent, via, status: "checking", at: Date.now(), result: null, undo: null, decidedBy: null, decisionVia: null, preview: null };
    state.calls.unshift(c);
    if (state.calls.length > 200) state.calls.pop();
    await record({ id: c.id, event: "requested", agent, via, tool, args, cls });

    const finish = async (status, message, entry) => {
      c.status = status;
      c.result = message;
      await record({ id: c.id, ...entry });
    };

    let clean;
    try {
      clean = checkArgs(tool, args);
    } catch (e) {
      await finish("failed", e.message, { event: "failed", tool, outcome: e.message });
      throw e;
    }

    const mode = state.policy[cls];
    if (mode === "block") {
      await finish("blocked", "Blocked by the operator's policy", { event: "decided", tool, decision: "blocked", decidedBy: "policy" });
      throw new Denied(`${tool} is blocked by the operator's policy, so it did not run.`);
    }
    if (mode === "ask") {
      c.preview = await preview(tool, clean);
      c.status = "paused";
      onChange();
      const d = await waitForDecision(c);
      c.decidedBy = d.by;
      c.decisionVia = d.via;
      if (d.decision !== "approved") {
        const why = d.decision === "timeout" ? "No decision within 15 minutes" : `Denied by ${d.by}`;
        await finish(d.decision, why, { event: "decided", tool, decision: d.decision, decidedBy: d.by, via: d.via, transcript: d.transcript });
        throw new Denied(d.decision === "timeout" ? `${tool} was not approved within 15 minutes, so it did not run.` : `The operator denied ${tool}, so it did not run.`);
      }
      await record({ id: c.id, event: "decided", tool, decision: "approved", decidedBy: d.by, via: d.via, transcript: d.transcript });
    } else {
      await record({ id: c.id, event: "decided", tool, decision: "auto", decidedBy: "policy" });
    }

    c.status = "running";
    onChange();
    try {
      const { text, undo } = await execute(tool, clean, c.id);
      c.undo = undo ?? null;
      await finish("ran", text, { event: "executed", tool, outcome: text.split("\n")[0] });
      return text;
    } catch (e) {
      await finish("failed", e.message, { event: "failed", tool, outcome: e.message });
      throw e;
    }
  }

  function decide(id, decision, { by = "operator", via = "click", transcript } = {}) {
    const w = waiting.get(id);
    if (!w) throw new Error("That call is not waiting for a decision");
    if (decision !== "approve" && decision !== "deny") throw new Error('Decision must be "approve" or "deny"');
    clearTimeout(w.timer);
    waiting.delete(id);
    w.resolve({ decision: decision === "approve" ? "approved" : "denied", by, via, transcript });
  }

  async function undo(id) {
    const c = state.calls.find((x) => x.id === id);
    if (!c || c.status !== "ran" || !c.undo) throw new Error("That call cannot be undone");
    const u = c.undo;
    // Undo only when the target is still in the state the gateway left it.
    if (u.kind === "rename") {
      if (!existsSync(inside(u.from))) throw new Error(`${u.from} has changed since, so the rename cannot be undone`);
      if (existsSync(inside(u.to))) throw new Error(`${u.to} exists again, so the rename cannot be undone`);
      await rename(inside(u.from), inside(u.to));
    } else if (u.kind === "file") {
      if (u.existed) await cp(join(snapshots, id, "previous"), inside(u.path));
      else await rm(inside(u.path), { force: true });
    } else if (u.kind === "tree") {
      if (existsSync(inside(u.path))) throw new Error(`${u.path} exists again, so the delete cannot be undone`);
      await cp(join(snapshots, id, "tree"), inside(u.path), { recursive: true });
    }
    const text = u.kind === "rename" ? `Restored ${u.to}` : u.kind === "tree" ? `Restored ${u.path}` : u.existed ? `Restored the previous ${u.path}` : `Removed ${u.path}`;
    c.status = "undone";
    c.undo = null;
    await record({ id, event: "undone", tool: c.tool, decidedBy: "operator", outcome: text });
    return text;
  }

  function setPolicy(cls, mode) {
    if (!CLASSES.includes(cls) || !MODES.includes(mode)) throw new Error("Unknown class or mode");
    state.policy[cls] = mode;
    void record({ event: "policy", cls, mode, decidedBy: "operator" });
  }

  function say(from, text) {
    state.chat.push({ id: randomUUID().slice(0, 8), from, text, at: Date.now() });
    if (state.chat.length > 100) state.chat.shift();
    onChange();
  }

  async function reset() {
    for (const [id, w] of waiting) {
      clearTimeout(w.timer);
      w.resolve({ decision: "denied", by: "reset", via: "reset" });
      waiting.delete(id);
    }
    await rm(root, { recursive: true, force: true });
    await cp(template, root, { recursive: true });
    await mkdir(dataDir, { recursive: true });
    // The log is append-only: a reset starts a new file and keeps the old one.
    if (existsSync(logFile)) await rename(logFile, join(dataDir, `activity-${Date.now()}.jsonl`));
    await rm(snapshots, { recursive: true, force: true });
    state.calls = [];
    state.log = [];
    state.chat = [];
    await record({ event: "reset", decidedBy: "operator" });
  }

  async function tree() {
    const build = async (dir) => {
      const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
      return Promise.all(entries.map(async (e) => ({ name: e.name, path: rel(join(dir, e.name)), dir: e.isDirectory(), children: e.isDirectory() ? await build(join(dir, e.name)) : undefined })));
    };
    return existsSync(root) ? build(root) : [];
  }

  async function snapshot() {
    return {
      policy: state.policy,
      calls: state.calls.map((c) => ({ ...c, result: typeof c.result === "string" ? c.result.slice(0, 1200) : c.result, undoable: c.status === "ran" && Boolean(c.undo) })),
      waiting: [...waiting.keys()],
      log: state.log.slice(-200),
      chat: state.chat,
      tree: await tree(),
    };
  }

  async function init() {
    await mkdir(dataDir, { recursive: true });
    if (!existsSync(root)) await cp(template, root, { recursive: true });
    if (existsSync(logFile)) {
      const lines = (await readFile(logFile, "utf8")).trim().split("\n").filter(Boolean);
      state.log = lines.slice(-500).map((l) => JSON.parse(l));
    }
  }

  return { init, call, decide, undo, setPolicy, say, reset, snapshot, state };
}
