// The demo script, one entry per scene. Both the video (subtitles, timing) and
// scripts/build-voice.mjs (voiceover) read this file, so edit the words here.
// "(pause)" is a silent beat. Seconds match the script's timestamps.

export const SCENES = [
  {
    id: "hook",
    start: 0,
    seconds: 45,
    text: "I’m going to give an AI agent a simple task. Find my project brief and summarize it. To do that, it needs to search the workspace and read a file. But suppose the same agent also has access to a tool that can delete an entire folder. What happens if it calls that tool while working on my request? I could read the agent’s chat and hope it tells me what it did. By then, the files could already be gone. That’s the problem we’re solving with Safe-Mode Gateway for Track 1. It gives people a way to control what their AI agents can actually do.",
  },
  {
    id: "how",
    start: 45,
    seconds: 50,
    text: "MCP lets an AI agent connect to tools like file search, cloud storage, or a database. Safe-Mode Gateway sits between the agent and those tools. Every tool call that goes through the gateway gets checked before it runs. We classify calls in three groups. Read actions retrieve information. Write actions change something, like renaming a file. Destructive actions can remove data, like deleting a folder. The operator sets the policy. In this demo, approved read tools run automatically. A write or destructive action pauses for a decision. That means I can let the agent search ten files without clicking ten times, and still stop it at the moment it tries to change one.",
  },
  {
    id: "allow-block",
    start: 95,
    seconds: 60,
    text: "Here’s the original task. Find the project brief. The agent calls the search tool, the gateway allows it, and the brief comes back. Now I’ll trigger a delete request to show what happens when the agent asks for something riskier. The agent wants to delete the client-files folder. The gateway pauses the call before it reaches the file tool. Look at the approval card. I can see the action, the exact folder it targets, and which agent requested it. I know exactly what I’m being asked to approve. I’ll hit Deny. (pause) The folder is still here. And in the activity log, you can see both events. The search ran. The deletion was requested and denied before it could run.",
  },
  {
    id: "approve-undo",
    start: 155,
    seconds: 65,
    text: "Sometimes the agent is supposed to make a change. Here it’s asking to rename project-brief.md to final-brief.md. The card shows the current name and the proposed name, so I can see the change before I approve it. I’ll approve this one. The gateway forwards the call, and the new filename appears in the workspace. (pause) Now imagine I approved too quickly. This was still a draft. I can click Undo, and the gateway uses the recorded original filename to reverse the rename. Undo depends on the action. A rename can be reversed when the file is still in the expected state. An email that’s already been delivered may be impossible to take back. The approval step is especially important for those actions.",
  },
  {
    id: "audit",
    start: 220,
    seconds: 50,
    text: "If I hand this workspace to a teammate tomorrow, they can open the log and reconstruct the whole sequence. The search ran automatically. The delete request was denied before execution. The rename was approved and completed. And the undo restored the original name. Each entry tells them what was requested, what decision was made, and what actually happened. That’s also how you’d diagnose a problem. If a file disappeared, you can check whether a delete request came through the gateway, who made the decision, and whether the tool actually ran.",
  },
  {
    id: "close",
    start: 270,
    seconds: 30,
    text: "We demoed this with files because you can see the result immediately. The same gateway can sit between compatible MCP agents and other connected tools, with policies that match the actions those tools can take. If an agent has access to your team’s workspace, you should be able to answer three questions. What did it try to do? Who allowed it? What actually happened? You just saw Safe-Mode Gateway answer all three.",
  },
];

export const FPS = 30;
export const TOTAL_SECONDS = 300;
