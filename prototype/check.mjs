// Self-check: `npm run check`. Runs the gateway on a throwaway copy of the demo workspace,
// then connects a real MCP client to the gateway's MCP endpoint.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { classify, createGateway, Denied } from "./gateway.mjs";
import { createMcpHandler } from "./mcp.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const tmp = await mkdtemp(join(tmpdir(), "smg-check-"));
const ws = join(tmp, "ws");
const gw = createGateway({ root: ws, template: join(here, "workspace-template"), dataDir: join(tmp, "data") });
await gw.init();

const paused = async (tool) => {
  for (let i = 0; i < 200; i++) {
    const c = gw.state.calls.find((x) => x.tool === tool && x.status === "paused");
    if (c) return c;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error(`${tool} never paused`);
};
const ran = (tool) => gw.state.calls.find((c) => c.tool === tool && c.status === "ran");

// Reads run on their own; anything unknown counts as destructive.
assert.match(await gw.call({ tool: "search_files", args: { query: "brief" } }), /project-brief\.md/);
assert.equal(classify("format_disk"), "destructive");

// A destructive call pauses with a preview, and a deny leaves the folder alone.
const del = gw.call({ tool: "delete_folder", args: { path: "client-files" } });
const card = await paused("delete_folder");
assert.equal(card.preview.items, 4);
gw.decide(card.id, "deny");
await assert.rejects(del, Denied);
assert.ok(existsSync(join(ws, "client-files")));

// An approved rename runs and can be undone.
const ren = gw.call({ tool: "rename_file", args: { from: "project-brief.md", to: "final-brief.md" } });
gw.decide((await paused("rename_file")).id, "approve");
await ren;
assert.ok(existsSync(join(ws, "final-brief.md")));
await gw.undo(ran("rename_file").id);
assert.ok(existsSync(join(ws, "project-brief.md")) && !existsSync(join(ws, "final-brief.md")));

// An approved delete can be undone from its snapshot.
const del2 = gw.call({ tool: "delete_folder", args: { path: "client-files" } });
gw.decide((await paused("delete_folder")).id, "approve");
await del2;
assert.ok(!existsSync(join(ws, "client-files")));
await gw.undo(ran("delete_folder").id);
assert.ok(existsSync(join(ws, "client-files", "invoices-2026", "inv-0002.txt")));

// An approved overwrite can be undone back to the previous content.
const before = await readFile(join(ws, "meeting-notes.txt"), "utf8");
const write = gw.call({ tool: "write_file", args: { path: "meeting-notes.txt", content: "replaced" } });
gw.decide((await paused("write_file")).id, "approve");
await write;
await gw.undo(ran("write_file").id);
assert.equal(await readFile(join(ws, "meeting-notes.txt"), "utf8"), before);

// Paths outside the workspace are refused, and "block" stops a class outright.
await assert.rejects(gw.call({ tool: "read_file", args: { path: "../../outside.txt" } }), /outside the workspace/);
gw.setPolicy("write", "block");
await assert.rejects(gw.call({ tool: "write_file", args: { path: "x.txt", content: "x" } }), /blocked/);
gw.setPolicy("write", "ask");

// The log is append-only JSON lines covering requests, decisions and outcomes.
const log = (await readFile(join(tmp, "data", "activity.jsonl"), "utf8")).trim().split("\n").map((l) => JSON.parse(l));
for (const event of ["requested", "decided", "executed", "undone"]) assert.ok(log.some((e) => e.event === event), event);
assert.ok(log.some((e) => e.event === "decided" && e.decision === "denied"));

// A real MCP client: tools list, an automatic read, and a paused delete that gets denied.
const handler = createMcpHandler(gw);
const srv = createServer((req, res) => void handler(req, res));
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const client = new Client({ name: "check", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${srv.address().port}/mcp`)));
const names = (await client.listTools()).tools.map((t) => t.name);
assert.deepEqual(names.sort(), ["delete_folder", "list_folder", "read_file", "rename_file", "search_files", "write_file"]);
assert.match((await client.callTool({ name: "read_file", arguments: { path: "meeting-notes.txt" } })).content[0].text, /Kickoff/);
const viaMcp = client.callTool({ name: "delete_folder", arguments: { path: "client-files" } });
gw.decide((await paused("delete_folder")).id, "deny");
const answer = await viaMcp;
assert.equal(answer.isError, true);
assert.match(answer.content[0].text, /denied/);
await client.close();
srv.close();

await rm(tmp, { recursive: true, force: true });
console.log("gateway checks ok: policy, pause, deny, approve, undo x3, sandbox, block, log, MCP");
