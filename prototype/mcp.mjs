// The MCP side: the gateway is an MCP server (Streamable HTTP, stateless) whose tools all run
// through gateway.call(), so any MCP agent that connects gets the same checks, pauses and log.
// No tool here can approve, undo or change the policy: only the operator's dashboard can.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { TOOLS } from "./gateway.mjs";

export function createMcpHandler(gateway) {
  const build = (agent) => {
    const server = new McpServer({ name: "safe-mode-gateway", version: "0.1.0" });
    for (const [name, spec] of Object.entries(TOOLS)) {
      const shape = Object.fromEntries(Object.entries(spec.params).map(([p, max]) => [p, z.string().max(max)]));
      server.registerTool(
        name,
        { description: `${spec.description} (${spec.cls} call: the Safe-Mode Gateway may pause it for a human decision)`, inputSchema: shape },
        async (args) => {
          try {
            const text = await gateway.call({ tool: name, args, agent, via: "mcp" });
            return { content: [{ type: "text", text }] };
          } catch (e) {
            return { content: [{ type: "text", text: e.message }], isError: true };
          }
        },
      );
    }
    return server;
  };

  return async (req, res) => {
    const agent = String(req.headers["x-agent-name"] ?? "mcp-agent").slice(0, 40);
    const server = build(agent);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  };
}
