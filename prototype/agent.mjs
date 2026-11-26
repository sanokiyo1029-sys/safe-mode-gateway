// The built-in demo agent, "brief-assistant". It needs no AI model: it maps a request to
// tool calls and sends every one through the gateway, exactly like an MCP agent would, so
// it pauses, gets denied or gets approved the same way.

const AGENT = "brief-assistant";

export const TASKS = {
  brief: "Find my project brief and summarize it.",
  delete: "Clean up: delete the client-files folder.",
  rename: "Rename project-brief.md to final-brief.md.",
  notes: "Add today's decisions to meeting-notes.txt.",
};

const intentOf = (text) => {
  const t = text.toLowerCase();
  if (/\b(delete|remove|clean|wipe)\b/.test(t)) return "delete";
  if (/\b(rename|final)\b/.test(t)) return "rename";
  if (/\b(note|notes|write|add)\b/.test(t)) return "notes";
  if (/\b(find|brief|summar|search|read)\b/.test(t)) return "brief";
  return null;
};

const summarize = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const title = lines.find((l) => l.startsWith("# "))?.slice(2) ?? "the project";
  const goal = lines[lines.findIndex((l) => /^## goal/i.test(l)) + 1] ?? "";
  const dates = lines.filter((l) => /^- \d/.test(l)).map((l) => l.slice(2));
  return `The brief is "${title}". ${goal} Key dates: ${dates.join("; ")}.`;
};

export function createAgent(gateway) {
  let busy = false;
  const say = (text) => gateway.say("agent", text);
  const use = (tool, args) => gateway.call({ tool, args, agent: AGENT, via: "demo agent" });

  const run = {
    async brief() {
      say("Searching the workspace for the brief.");
      const found = await use("search_files", { query: "brief" });
      const path = found.split("\n").slice(1).map((l) => l.split(":")[0]).find((p) => /brief/i.test(p));
      if (!path) return say("I couldn't find a brief in the workspace.");
      const text = await use("read_file", { path });
      say(`Done. ${summarize(text)}`);
    },
    async delete() {
      say("Deleting client-files/ to tidy up the workspace.");
      await use("delete_folder", { path: "client-files" });
      say("Deleted client-files/.");
    },
    async rename() {
      say("Renaming the brief to final-brief.md.");
      await use("rename_file", { from: "project-brief.md", to: "final-brief.md" });
      say("Renamed. The brief is now final-brief.md.");
    },
    async notes() {
      say("Adding today's decisions to the meeting notes.");
      const before = await use("read_file", { path: "meeting-notes.txt" });
      await use("write_file", { path: "meeting-notes.txt", content: `${before.trimEnd()}\n- Decision: beta invites go out on 1 December.\n` });
      say("Added one line to meeting-notes.txt.");
    },
  };

  async function ask(text) {
    if (busy) throw new Error("The demo agent is still working on the last request");
    gateway.say("you", text);
    const intent = intentOf(text);
    if (!intent) {
      say("I can find and summarize the brief, rename it, add to the meeting notes, or clean up client-files/.");
      return;
    }
    busy = true;
    try {
      await run[intent]();
    } catch (e) {
      say(e.message);
    } finally {
      busy = false;
    }
  }

  return { ask, isBusy: () => busy };
}
