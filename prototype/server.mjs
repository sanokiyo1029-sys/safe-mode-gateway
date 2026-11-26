// Safe-Mode Gateway prototype server.
//   /       the operator dashboard (live state over server-sent events)
//   /mcp    the gateway's MCP endpoint (Streamable HTTP) for any MCP agent
//   /api/*  operator actions; each needs the per-run operator token the dashboard carries
// Binds to 127.0.0.1 only. ElevenLabs read-aloud is used when ELEVENLABS_API_KEY is set in
// prototype/.env or ../.env; otherwise the dashboard falls back to the browser's own voice.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAgent, TASKS } from "./agent.mjs";
import { createGateway } from "./gateway.mjs";
import { createMcpHandler } from "./mcp.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const envFile = [join(here, ".env"), join(here, "..", ".env")].find(existsSync);
if (envFile) process.loadEnvFile(envFile);

const PORT = Number(process.env.PORT ?? 8787);
const HOST = "127.0.0.1";
const TOKEN = randomBytes(16).toString("hex");
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "cgSgspJ2msm6clMCkdW9"; // ElevenLabs built-in "Jessica"
const HAS_ELEVENLABS = Boolean(process.env.ELEVENLABS_API_KEY);

const clients = new Set();
let queued = null;
const broadcast = () => {
  if (queued) return;
  queued = setTimeout(async () => {
    queued = null;
    const data = `event: state\ndata: ${JSON.stringify(await gateway.snapshot())}\n\n`;
    for (const res of clients) res.write(data);
  }, 30);
};

const gateway = createGateway({
  root: join(here, ".workspace"),
  template: join(here, "workspace-template"),
  dataDir: join(here, ".data"),
  onChange: broadcast,
});
await gateway.init();
const agent = createAgent(gateway);
const mcp = createMcpHandler(gateway);

const STATIC = {
  "/app.css": "text/css; charset=utf-8",
  "/app.js": "text/javascript; charset=utf-8",
  "/favicon.svg": "image/svg+xml",
};
const SECURITY = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'",
};

const send = (res, status, body, type) => {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store", ...SECURITY });
  res.end(body);
};
const json = (res, status, body) => send(res, status, JSON.stringify(body), "application/json; charset=utf-8");

const readJson = (req) =>
  new Promise((ok, fail) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 65_536) {
        fail(new Error("The request is too large"));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
      } catch {
        fail(new Error("The request is not valid JSON"));
      }
    });
    req.on("error", fail);
  });

// What the read-aloud says for a paused call.
const spokenCard = (c) => {
  const what =
    c.tool === "delete_folder"
      ? `delete the folder ${c.args.path}${c.preview?.items ? `, with ${c.preview.items} files in it` : ""}`
      : c.tool === "rename_file"
        ? `rename ${c.args.from} to ${c.args.to}`
        : c.tool === "write_file"
          ? `write to ${c.args.path}`
          : c.tool.replaceAll("_", " ");
  return `${c.agent.replaceAll("-", " ")} wants to ${what}. Approve, or deny?`;
};

const speech = new Map();
const elevenLabs = async (text) => {
  if (speech.has(text)) return speech.get(text);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE_ID)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL ?? "eleven_flash_v2_5" }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`ElevenLabs answered ${res.status}`);
  const audio = Buffer.from(await res.arrayBuffer());
  speech.set(text, audio);
  return audio;
};

const page = () =>
  readFileSync(join(here, "public/index.html"), "utf8")
    .replace("__OPERATOR_TOKEN__", TOKEN)
    .replace("__VOICE__", HAS_ELEVENLABS ? "elevenlabs" : "browser")
    .replaceAll("__MCP_URL__", `http://${HOST}:${PORT}/mcp`);

const allowedHosts = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);

const server = createServer(async (req, res) => {
  // DNS-rebinding guard: only answer requests addressed to this machine.
  if (!allowedHosts.has(String(req.headers.host))) return send(res, 421, "Wrong host", "text/plain");
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/mcp") return await mcp(req, res);
    if (req.method === "GET" && url.pathname === "/") return send(res, 200, page(), "text/html; charset=utf-8");
    if (req.method === "GET" && STATIC[url.pathname]) return send(res, 200, readFileSync(join(here, "public", url.pathname.slice(1))), STATIC[url.pathname]);
    if (!url.pathname.startsWith("/api/")) return send(res, 404, "Not found", "text/plain");

    const token = req.headers["x-operator-token"] ?? url.searchParams.get("token");
    if (token !== TOKEN) return json(res, 401, { error: "This dashboard's session has expired. Reload the page." });

    if (req.method === "GET" && url.pathname === "/api/events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive", ...SECURITY });
      res.write(`event: state\ndata: ${JSON.stringify(await gateway.snapshot())}\n\n`);
      clients.add(res);
      const ping = setInterval(() => res.write(": ping\n\n"), 20_000);
      req.on("close", () => {
        clients.delete(res);
        clearInterval(ping);
      });
      return;
    }
    if (req.method !== "POST") return json(res, 405, { error: "Use POST" });
    if (!String(req.headers["content-type"]).startsWith("application/json")) return json(res, 415, { error: "Send JSON" });
    const body = await readJson(req);

    switch (url.pathname) {
      case "/api/decide": {
        const id = String(body.id ?? "");
        const call = gateway.state.calls.find((c) => c.id === id);
        const via = ["voice", "keyboard"].includes(body.via) ? body.via : "click";
        if (via === "voice" && body.decision === "approve" && call?.cls === "destructive") {
          return json(res, 409, { error: "Approving a destructive call needs a click on Approve." });
        }
        gateway.decide(id, body.decision, { via, transcript: typeof body.transcript === "string" ? body.transcript.slice(0, 200) : undefined });
        return json(res, 200, { ok: true });
      }
      case "/api/undo":
        return json(res, 200, { ok: true, text: await gateway.undo(String(body.id ?? "")) });
      case "/api/policy":
        gateway.setPolicy(body.cls, body.mode);
        return json(res, 200, { ok: true });
      case "/api/agent": {
        const text = TASKS[body.task] ?? String(body.text ?? "").trim().slice(0, 300);
        if (!text) return json(res, 400, { error: "Type a request for the agent first." });
        if (agent.isBusy()) return json(res, 409, { error: "The demo agent is still working on the last request." });
        void agent.ask(text);
        return json(res, 202, { ok: true });
      }
      case "/api/reset":
        await gateway.reset();
        return json(res, 200, { ok: true });
      case "/api/speak": {
        const call = gateway.state.calls.find((c) => c.id === String(body.id ?? ""));
        if (!call) return json(res, 404, { error: "That call is gone." });
        const text = spokenCard(call);
        if (!HAS_ELEVENLABS) return json(res, 200, { text });
        try {
          return send(res, 200, await elevenLabs(text), "audio/mpeg");
        } catch (e) {
          return json(res, 200, { text, warning: e.message });
        }
      }
      default:
        return json(res, 404, { error: "Unknown action" });
    }
  } catch (e) {
    if (!res.headersSent) json(res, 400, { error: e.message });
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Safe-Mode Gateway dashboard  http://${HOST}:${PORT}`);
  console.log(`MCP endpoint                 http://${HOST}:${PORT}/mcp`);
  console.log(`Read-aloud voice             ${HAS_ELEVENLABS ? "ElevenLabs" : "browser (no ELEVENLABS_API_KEY)"}`);
});
