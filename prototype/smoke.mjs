// Demo-day smoke test: `npm run smoke` while `npm start` is running. It plays the whole demo
// story against the live server (as the dashboard would, plus a real MCP client), checks every
// outcome, then resets the demo so it is clean for the audience.
import assert from "node:assert/strict";
import http from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const BASE = process.env.GATEWAY_URL ?? "http://127.0.0.1:8787";
const page = await fetch(BASE).catch(() => null);
if (!page?.ok) {
  console.error(`No gateway at ${BASE}. Start it first: npm start`);
  process.exit(1);
}
const token = (await page.text()).match(/name="operator-token" content="([0-9a-f]+)"/)?.[1];
assert.ok(token, "the dashboard page carries an operator token");

// Follow live state over the same server-sent events the dashboard uses.
let state = null;
const waiters = new Set();
const stream = new AbortController();
const events = await fetch(`${BASE}/api/events?token=${token}`, { signal: stream.signal });
void (async () => {
  const reader = events.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buf += value;
    for (let i = buf.indexOf("\n\n"); i >= 0; i = buf.indexOf("\n\n")) {
      const data = buf.slice(0, i).split("\n").find((l) => l.startsWith("data: "));
      buf = buf.slice(i + 2);
      if (data) {
        state = JSON.parse(data.slice(6));
        for (const w of [...waiters]) w();
      }
    }
  }
})().catch(() => {});

const until = (pred, what, ms = 10_000) =>
  new Promise((ok, fail) => {
    const check = () => {
      if (!state || !pred(state)) return;
      waiters.delete(check);
      clearTimeout(timer);
      ok(state);
    };
    const timer = setTimeout(() => {
      waiters.delete(check);
      fail(new Error(`timed out waiting until ${what}`));
    }, ms);
    waiters.add(check);
    check();
  });

const post = async (path, body = {}, auth = true) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(auth ? { "x-operator-token": token } : {}) },
    body: JSON.stringify(body),
  });
  const json = (res.headers.get("content-type") ?? "").includes("json");
  return { status: res.status, type: res.headers.get("content-type"), body: json ? await res.json() : await res.arrayBuffer() };
};

const has = (s, path) => {
  const walk = (nodes) => nodes.some((n) => n.path === path || (n.children && walk(n.children)));
  return walk(s.tree);
};
const latest = (s, tool, status) => s.calls.find((c) => c.tool === tool && (!status || c.status === status));
const idle = (s) => !s.calls.some((c) => c.via === "demo agent" && ["paused", "running", "checking"].includes(c.status));
const ok = (name) => console.log(`  ok  ${name}`);

console.log(`Smoke test against ${BASE}`);
await until(() => true, "the first state arrives");

assert.equal((await post("/api/reset")).status, 200);
await until((s) => s.calls.length === 0 && has(s, "client-files") && has(s, "project-brief.md"), "the demo is reset");
ok("reset: workspace restored");

assert.equal((await post("/api/agent", { task: "brief" })).status, 202);
await until((s) => latest(s, "read_file", "ran") && s.chat.some((m) => m.text.startsWith("Done.")) && idle(s), "the brief is summarized");
ok("step 1: search and read ran on their own, brief summarized");

await post("/api/agent", { task: "delete" });
let s = await until((x) => latest(x, "delete_folder", "paused"), "the delete pauses");
const del = latest(s, "delete_folder", "paused");
assert.equal(del.preview.items, 4);
const speech = await post("/api/speak", { id: del.id });
assert.equal(speech.status, 200);
ok(`step 2: delete paused (4 files), read-aloud ${String(speech.type).startsWith("audio/") ? "audio from ElevenLabs" : "text for the browser voice"}`);
const voiceApprove = await post("/api/decide", { id: del.id, decision: "approve", via: "voice", transcript: "approve" });
assert.equal(voiceApprove.status, 409);
ok("a spoken approve cannot approve a delete");
assert.equal((await post("/api/decide", { id: del.id, decision: "deny" })).status, 200);
await until((x) => latest(x, "delete_folder")?.status === "denied" && has(x, "client-files") && idle(x), "the delete is denied");
ok("step 2: denied, client-files/ untouched");

await post("/api/agent", { task: "rename" });
s = await until((x) => latest(x, "rename_file", "paused"), "the rename pauses");
assert.equal((await post("/api/decide", { id: latest(s, "rename_file", "paused").id, decision: "approve", via: "voice", transcript: "approve" })).status, 200);
s = await until((x) => latest(x, "rename_file", "ran") && has(x, "final-brief.md") && idle(x), "the rename runs");
ok("step 3: rename approved by voice and ran");
const undo = await post("/api/undo", { id: latest(s, "rename_file", "ran").id });
assert.equal(undo.status, 200, JSON.stringify(undo.body));
await until((x) => has(x, "project-brief.md") && !has(x, "final-brief.md"), "the rename is undone");
ok("step 4: undo restored project-brief.md");

const events5 = new Set(state.log.map((e) => e.event));
for (const e of ["requested", "decided", "executed", "undone"]) assert.ok(events5.has(e), e);
ok("step 5: the activity log has requests, decisions, results and the undo");

assert.equal((await post("/api/policy", { cls: "destructive", mode: "block" })).status, 200);
const client = new Client({ name: "smoke", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(`${BASE}/mcp`), { requestInit: { headers: { "x-agent-name": "smoke-test-agent" } } }));
assert.equal((await client.listTools()).tools.length, 6);
assert.match((await client.callTool({ name: "search_files", arguments: { query: "invoice" } })).content[0].text, /inv-000/);
const blocked = await client.callTool({ name: "delete_folder", arguments: { path: "client-files" } });
assert.equal(blocked.isError, true);
assert.match(blocked.content[0].text, /blocked/);
await client.close();
assert.equal((await post("/api/policy", { cls: "destructive", mode: "ask" })).status, 200);
ok("MCP client: 6 tools, reads run, deletes blocked when the policy says Block");

assert.equal((await post("/api/reset", {}, false)).status, 401);
// fetch() drops a custom Host header, so send this one with the raw HTTP client.
const wrongHost = await new Promise((done, fail) => {
  const u = new URL(BASE);
  http.get({ hostname: u.hostname, port: u.port, path: "/", headers: { host: "evil.example" } }, (r) => (r.resume(), done(r.statusCode))).on("error", fail);
});
assert.equal(wrongHost, 421);
ok("operator actions need the token; other host names are refused");

await post("/api/reset");
await until((s2) => s2.calls.length === 0, "the final reset");
stream.abort();
console.log("Smoke test passed. The demo is reset and ready.");
process.exit(0);
