// Safe-Mode Gateway operator dashboard. Live state arrives over server-sent events; lists are
// updated in place by id so focus and animations survive updates. All text is set with
// textContent, never as HTML.
const token = document.querySelector('meta[name="operator-token"]').content;
const engine = document.querySelector('meta[name="voice-engine"]').content;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const NS = "http://www.w3.org/2000/svg";
const DECISION_MS = 15 * 60 * 1000;
const $ = (s) => document.querySelector(s);

const icon = (name) => {
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("aria-hidden", "true");
  const u = document.createElementNS(NS, "use");
  u.setAttribute("href", `#i-${name}`);
  s.append(u);
  return s;
};

const el = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  e.append(...kids.filter((k) => k != null && k !== false));
  return e;
};

let state = null;
let first = true;
let voiceOn = false;
const spoken = new Set();

const api = async (path, body = {}) => {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-operator-token": token },
    body: JSON.stringify(body),
  });
  const data = (res.headers.get("content-type") || "").includes("application/json") ? await res.json() : null;
  if (!res.ok) throw new Error(data?.error || `The gateway answered ${res.status}`);
  return data;
};

const toast = (text, kind) => {
  const t = el("div", { class: `toast${kind === "error" ? " error" : ""}`, text });
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 4500);
};

const act = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    toast(e.message, "error");
    return null;
  }
};

const clock = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const firstLine = (s) => String(s ?? "").split("\n")[0];
const argText = (args) =>
  Object.entries(args)
    .map(([k, v]) => (k === "content" ? `content: ${v.length} chars` : `${k}: "${v}"`))
    .join(", ");

const STATUS = {
  checking: "Checking",
  paused: "Waiting for you",
  running: "Running",
  ran: "Ran",
  denied: "Denied",
  timeout: "Timed out",
  blocked: "Blocked by policy",
  failed: "Failed",
  undone: "Undone",
};
const statusText = (c) => {
  if (c.status === "ran") return c.decidedBy ? `Approved${c.decisionVia === "voice" ? " by voice" : ""} · ran` : "Ran · auto";
  if (c.status === "denied") return `Denied${c.decisionVia === "voice" ? " by voice" : ""}`;
  return STATUS[c.status] ?? c.status;
};

// ---------- Decisions ----------
const ICON = { delete_folder: "trash", rename_file: "pencil", write_file: "file", search_files: "search", read_file: "eye", list_folder: "folder" };

const title = (c) => {
  const code = (t) => el("span", { class: "mono", text: t });
  if (c.tool === "delete_folder") return ["Delete ", code(`${c.args.path}/`), "?"];
  if (c.tool === "rename_file") return ["Rename ", code(c.args.from), "?"];
  if (c.tool === "write_file") return [c.preview?.exists ? "Overwrite " : "Create ", code(c.args.path), "?"];
  return ["Run ", code(c.tool), "?"];
};

const facts = (c) => {
  const rows = [["Action", c.tool]];
  if (c.tool === "delete_folder") {
    rows.push(["Target", `${c.args.path}/`]);
    if (c.preview?.items != null) rows.push(["Scope", `${c.preview.items} file${c.preview.items === 1 ? "" : "s"} inside`]);
    rows.push(["If approved", "Snapshotted first, so Undo can bring it back"]);
  } else if (c.tool === "rename_file") {
    rows.push(["From", c.args.from], ["To", c.args.to], ["If approved", "Undo renames it back"]);
  } else if (c.tool === "write_file") {
    rows.push(["File", c.args.path], ["Content", `${c.preview?.bytes ?? c.args.content.length} bytes`]);
    rows.push(["If approved", c.preview?.exists ? "The old version is kept for Undo" : "Undo removes the new file"]);
  } else {
    rows.push(["Arguments", argText(c.args)]);
  }
  rows.push(["Requested by", `${c.agent} · ${c.via}`]);
  return el("dl", { class: "facts" }, ...rows.flatMap(([k, v]) => [el("dt", { text: k }), el("dd", { class: k === "Action" || k === "Target" || k === "From" || k === "To" || k === "File" ? "mono" : null, text: v })]));
};

const cards = new Map();

const decide = async (card, id, decision, via = "click", transcript) => {
  for (const b of card.querySelectorAll("button")) b.disabled = true;
  const ok = await act(() => api("/api/decide", { id, decision, via, transcript }));
  if (!ok) {
    for (const b of card.querySelectorAll("button")) b.disabled = false;
    return;
  }
  const how = via === "voice" ? " by voice" : "";
  toast(decision === "approve" ? `Approved ${card.dataset.tool}${how}. It's running now.` : `Denied ${card.dataset.tool}${how}. Nothing ran.`);
};

const decisionCard = (c) => {
  const note = el("p", { class: "voice-note", role: "status" });
  const listenBtn = Recognition
    ? el("button", { class: "btn btn-quiet btn-small listen", type: "button", onclick: () => listen(card, c, listenBtn, note) }, icon("mic"), el("span", { text: "Answer by voice" }))
    : null;
  const approve = el(
    "button",
    { class: `btn btn-approve ${c.cls === "destructive" ? "btn-danger" : "btn-primary"}`, type: "button", onclick: () => decide(card, c.id, "approve") },
    icon("check"),
    el("span", { text: c.cls === "destructive" ? "Approve delete" : "Approve" }),
    el("span", { class: "kbd", "aria-hidden": "true", text: "A" }),
  );
  const deny = el("button", { class: "btn btn-deny", type: "button", onclick: () => decide(card, c.id, "deny") }, icon("x"), el("span", { text: "Deny" }), el("span", { class: "kbd", "aria-hidden": "true", text: "D" }));
  const card = el(
    "article",
    { class: "decision", "data-id": c.id, "data-cls": c.cls, "data-tool": c.tool, "data-at": String(c.at), "aria-labelledby": `d-${c.id}` },
    el("div", { class: "decision-head" }, el("div", { class: "decision-icon" }, icon(ICON[c.tool] ?? "shield")), el("h3", { id: `d-${c.id}` }, ...title(c)), el("span", { class: `cls cls-${c.cls}`, text: c.cls })),
    facts(c),
    note,
    el(
      "div",
      { class: "decision-foot" },
      el("button", { class: "btn btn-quiet btn-small", type: "button", onclick: () => readAloud(c.id) }, icon("volume"), el("span", { text: "Read aloud" })),
      listenBtn,
      el("span", { class: "countdown" }),
      el("div", { class: "decision-actions" }, deny, approve),
    ),
  );
  return card;
};

const pending = () => state.calls.filter((c) => c.status === "paused").reverse();

const renderDecisions = () => {
  const list = $("#decision-list");
  const open = pending();
  const ids = new Set(open.map((c) => c.id));
  for (const [id, card] of cards) {
    if (ids.has(id)) continue;
    cards.delete(id);
    card.classList.add("leaving");
    setTimeout(() => card.remove(), 200);
  }
  open.forEach((c, i) => {
    let card = cards.get(c.id);
    if (!card) {
      card = decisionCard(c);
      if (first) card.classList.add("static"); // what is already there at load appears without motion
      cards.set(c.id, card);
      list.append(card);
      if (voiceOn && !spoken.has(c.id)) {
        spoken.add(c.id);
        readAloud(c.id);
      }
    }
    card.toggleAttribute("data-first", i === 0);
  });
  $("#decision-empty").hidden = open.length > 0;
  const count = $("#decision-count");
  count.hidden = open.length < 2;
  count.textContent = String(open.length);
  tickCountdowns();
};

const tickCountdowns = () => {
  for (const card of cards.values()) {
    const left = Math.max(0, Number(card.dataset.at) + DECISION_MS - Date.now());
    const m = Math.floor(left / 60000);
    const s = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
    card.querySelector(".countdown").textContent = `Auto-denies in ${m}:${s}`;
  }
};
setInterval(tickCountdowns, 1000);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  if (e.target.closest("input, textarea, select, [contenteditable]")) return;
  const key = e.key.toLowerCase();
  if (key !== "a" && key !== "d") return;
  const card = [...cards.values()].find((c) => c.hasAttribute("data-first"));
  if (!card) return;
  e.preventDefault();
  decide(card, card.dataset.id, key === "a" ? "approve" : "deny", "keyboard");
});

// ---------- Voice ----------
let audio = null;
const speakWithBrowser = (text) => {
  if (!("speechSynthesis" in window)) return toast("This browser can't read aloud.", "error");
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
};

const readAloud = async (id) => {
  try {
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "content-type": "application/json", "x-operator-token": token },
      body: JSON.stringify({ id }),
    });
    const type = res.headers.get("content-type") || "";
    if (type.startsWith("audio/")) {
      const url = URL.createObjectURL(await res.blob());
      audio?.pause();
      audio = new Audio(url);
      audio.addEventListener("ended", () => URL.revokeObjectURL(url));
      await audio.play();
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    speakWithBrowser(data.text);
  } catch (e) {
    toast(`Couldn't read it aloud: ${e.message}`, "error");
  }
};

const listen = (card, c, btn, note) => {
  const rec = new Recognition();
  rec.lang = "en-US";
  rec.maxAlternatives = 3;
  btn.classList.add("listening");
  btn.querySelector("span").textContent = "Listening…";
  note.textContent = "";
  rec.onresult = (ev) => {
    const heard = [...ev.results[0]].map((a) => a.transcript.toLowerCase().replace(/[^a-z ]/g, "").trim());
    // Only the exact words count, so a misheard phrase can't approve anything.
    const decision = heard.includes("approve") ? "approve" : heard.includes("deny") ? "deny" : null;
    if (!decision) {
      note.textContent = `Heard “${heard[0] || "nothing"}”. Say “approve” or “deny”.`;
      return;
    }
    if (decision === "approve" && c.cls === "destructive") {
      note.textContent = "Heard “approve”. Deleting still needs a click on Approve delete.";
      card.querySelector(".btn-approve").focus();
      return;
    }
    decide(card, c.id, decision, "voice", decision);
  };
  rec.onerror = (ev) => {
    note.textContent = ev.error === "not-allowed" ? "Microphone access is blocked for this page." : "Didn't catch that. Try again.";
  };
  rec.onend = () => {
    btn.classList.remove("listening");
    btn.querySelector("span").textContent = "Answer by voice";
  };
  rec.start();
};

const voiceToggle = $("#voice-toggle");
voiceToggle.title = engine === "elevenlabs" ? "Read new decisions aloud with ElevenLabs" : "Read new decisions aloud with the browser's voice (add an ElevenLabs key for a better one)";
voiceToggle.addEventListener("click", () => {
  voiceOn = !voiceOn;
  voiceToggle.setAttribute("aria-pressed", String(voiceOn));
  $("#voice-label").textContent = voiceOn ? "Voice on" : "Voice off";
  if (voiceOn && state) {
    const next = pending()[0];
    if (next) {
      spoken.add(next.id);
      readAloud(next.id);
    }
  }
});

// ---------- Calls ----------
const rows = new Map();

const callRow = (c) => {
  const undo = el(
    "button",
    {
      class: "btn btn-quiet btn-small undo",
      type: "button",
      onclick: async () => {
        undo.disabled = true;
        const res = await act(() => api("/api/undo", { id: c.id }));
        if (res) toast(res.text);
        else undo.disabled = false;
      },
    },
    icon("undo"),
    el("span", { text: "Undo" }),
  );
  const row = el(
    "li",
    { class: "call", "data-id": c.id },
    el("span", { class: `cls cls-${c.cls}`, text: c.cls }),
    el("div", { class: "call-what" }, el("b", { text: c.tool }), el("span", { class: "args", text: `(${argText(c.args)})` })),
    el("div", { class: "call-meta" }),
    el("div", { class: "call-side" }, el("span", { class: "status" }), undo),
  );
  row.addEventListener("animationend", (e) => {
    if (e.animationName === "row-flash") row.classList.remove("new");
  });
  return row;
};

const updateRow = (row, c) => {
  const status = row.querySelector(".status");
  status.dataset.s = c.status;
  status.textContent = statusText(c);
  const meta = row.querySelector(".call-meta");
  meta.textContent = `${c.agent} · ${c.via} · ${clock(c.at)}${c.result ? ` · ${firstLine(c.result)}` : ""}`;
  meta.title = c.result ?? "";
  row.querySelector(".undo").hidden = !c.undoable;
};

const renderCalls = () => {
  const list = $("#call-list");
  const ids = new Set(state.calls.map((c) => c.id));
  for (const [id, row] of rows) {
    if (!ids.has(id)) {
      row.remove();
      rows.delete(id);
    }
  }
  for (const c of [...state.calls].reverse()) {
    let row = rows.get(c.id);
    if (!row) {
      row = callRow(c);
      rows.set(c.id, row);
      if (!first) row.classList.add("new");
      list.prepend(row);
    }
    updateRow(row, c);
  }
  $("#calls-empty").hidden = state.calls.length > 0;
};

// ---------- Activity log ----------
const describe = (e) => {
  const who = `${e.decidedBy ?? "operator"}${e.via ? ` (${e.via})` : ""}${e.transcript ? `: “${e.transcript}”` : ""}`;
  switch (e.event) {
    case "requested":
      return ["Requested", "", `${e.agent} via ${e.via}`];
    case "decided":
      if (e.decision === "auto") return ["Allowed", "good", "Policy runs this class automatically"];
      if (e.decision === "approved") return ["Approved", "good", `By ${who}`];
      if (e.decision === "blocked") return ["Blocked", "bad", "Blocked by the policy"];
      if (e.decision === "timeout") return ["Timed out", "bad", "No decision within 15 minutes"];
      return ["Denied", "bad", `By ${who}`];
    case "executed":
      return ["Ran", "good", e.outcome];
    case "failed":
      return ["Failed", "bad", e.outcome];
    case "undone":
      return ["Undone", "accent", e.outcome];
    case "policy":
      return ["Policy", "accent", `${e.cls} calls now ${e.mode === "run" ? "run automatically" : e.mode === "ask" ? "ask first" : "are blocked"}`];
    case "reset":
      return ["Reset", "accent", "Demo workspace restored, new log started"];
    default:
      return [e.event, "", ""];
  }
};

const renderLog = () => {
  const body = $("#log-body");
  const entries = [...state.log].reverse();
  body.replaceChildren(
    ...(entries.length
      ? entries.map((e) => {
          const [label, tone, detail] = describe(e);
          return el("tr", {}, el("td", { text: clock(e.ts) }), el("td", {}, el("span", { class: "ev", "data-tone": tone || null, text: label })), el("td", { text: e.tool ?? "–" }), el("td", { text: detail ?? "" }));
        })
      : [el("tr", {}, el("td", { colspan: "4", class: "empty", text: "Nothing logged yet." }))]),
  );
};

$("#download-log").addEventListener("click", () => {
  const blob = new Blob(state.log.map((e) => `${JSON.stringify(e)}\n`), { type: "application/x-ndjson" });
  const a = el("a", { href: URL.createObjectURL(blob), download: "safe-mode-activity.jsonl" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// ---------- Workspace ----------
let seenPaths = null;
// Paths a waiting call would touch: a delete marks the whole folder, a write or rename its file.
const atRisk = () =>
  pending().map((c) => ({ path: (c.args.path ?? c.args.from ?? "").replace(/^[/\\]+|[/\\]+$/g, ""), cls: c.cls === "destructive" ? "at-risk" : "pending" }));

const renderTree = () => {
  const paths = new Set();
  const risks = atRisk();
  const build = (nodes) =>
    nodes.map((n) => {
      paths.add(n.path);
      const risk = risks.find((r) => r.path && (n.path === r.path || n.path.startsWith(`${r.path}/`)));
      const node = el(
        "div",
        { class: `node${risk ? ` ${risk.cls}` : ""}`, "data-dir": n.dir || null, title: risk ? `${n.path}: waiting for your decision` : n.path },
        icon(n.dir ? "folder" : "file"),
        el("span", { text: n.dir ? `${n.name}/` : n.name }),
      );
      if (seenPaths && !seenPaths.has(n.path)) node.classList.add("changed");
      return el("li", {}, node, n.children?.length ? el("ul", {}, ...build(n.children)) : null);
    });
  const tree = $("#tree");
  tree.replaceChildren(...(state.tree.length ? build(state.tree) : [el("li", { class: "empty", text: "The workspace is empty. Reset the demo to restore it." })]));
  seenPaths = paths;
};

// ---------- Policy ----------
const POLICY = [
  ["read", "Read", "Search, read, list"],
  ["write", "Write", "Write, rename"],
  ["destructive", "Destructive", "Delete"],
];
const MODES = [
  ["run", "Run"],
  ["ask", "Ask"],
  ["block", "Block"],
];
let shownPolicy = "";

const renderPolicy = () => {
  const key = JSON.stringify(state.policy);
  if (key === shownPolicy) return;
  shownPolicy = key;
  const focused = document.activeElement?.closest?.(".seg")?.dataset.cls;
  $("#policy").replaceChildren(
    ...POLICY.map(([cls, name, desc]) => {
      const seg = el("div", { class: "seg", role: "radiogroup", "aria-label": `${name} calls`, "data-cls": cls });
      for (const [mode, label] of MODES) {
        const on = state.policy[cls] === mode;
        seg.append(el("button", { type: "button", role: "radio", "aria-checked": String(on), tabindex: on ? "0" : "-1", "data-mode": mode, text: label, onclick: () => setPolicy(cls, mode) }));
      }
      seg.addEventListener("keydown", (e) => {
        const i = MODES.findIndex(([m]) => m === state.policy[cls]);
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        setPolicy(cls, MODES[(i + step + MODES.length) % MODES.length][0]);
      });
      return el("div", { class: "prow" }, el("span", { class: "prow-name", text: name }), el("span", { class: "prow-desc", text: desc }), seg);
    }),
  );
  if (focused) $(`.seg[data-cls="${focused}"] [aria-checked="true"]`)?.focus();
};

const setPolicy = (cls, mode) => act(() => api("/api/policy", { cls, mode }));

// ---------- Agent ----------
const bubbles = new Map();
const renderChat = () => {
  const chat = $("#chat");
  if (!state.chat.length) {
    bubbles.clear();
    chat.replaceChildren(el("li", { class: "empty", text: "Pick a task below. Every tool call the agent makes goes through the gateway, so the risky ones stop and wait for you." }));
  } else {
    chat.querySelector(".empty")?.remove();
    const ids = new Set(state.chat.map((m) => m.id));
    for (const [id, b] of bubbles) if (!ids.has(id)) (b.remove(), bubbles.delete(id));
    for (const m of state.chat) {
      if (bubbles.has(m.id)) continue;
      const b = el("li", { class: `msg ${m.from}${first ? " static" : ""}`, text: m.text });
      bubbles.set(m.id, b);
      chat.append(b);
    }
  }
  const waiting = state.calls.some((c) => c.via === "demo agent" && c.status === "paused");
  const working = state.calls.some((c) => c.via === "demo agent" && ["paused", "running", "checking"].includes(c.status));
  let line = chat.querySelector(".msg.system");
  if (waiting && !line) {
    line = el("li", { class: "msg system" }, icon("shield"), el("span", { text: "Waiting for your decision" }));
    chat.append(line);
  } else if (!waiting && line) line.remove();
  else if (line) chat.append(line);
  for (const chip of document.querySelectorAll(".chip")) chip.disabled = working;
  chat.scrollTop = chat.scrollHeight;
};

for (const chip of document.querySelectorAll("[data-task]")) {
  chip.addEventListener("click", () => act(() => api("/api/agent", { task: chip.dataset.task })));
}

$("#composer").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("#ask");
  const text = input.value.trim();
  if (!text) return input.focus();
  const ok = await act(() => api("/api/agent", { text }));
  if (ok) input.value = "";
});

// ---------- Chrome ----------
for (const b of document.querySelectorAll("[data-copy]")) {
  b.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      toast("Copied");
    } catch {
      toast("Couldn't copy. Select the text instead.", "error");
    }
  });
}

const resetBtn = $("#reset");
let armed = null;
resetBtn.addEventListener("click", async () => {
  const label = resetBtn.querySelector("span");
  if (!armed) {
    label.textContent = "Click again to reset";
    armed = setTimeout(() => {
      armed = null;
      label.textContent = "Reset demo";
    }, 3000);
    return;
  }
  clearTimeout(armed);
  armed = null;
  label.textContent = "Reset demo";
  if (await act(() => api("/api/reset"))) toast("Demo reset: workspace restored, new log started");
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
const selectTab = (tab) => {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  }
  $("#download-log").hidden = tab.id !== "tab-log";
  if (tab.id === "tab-log" && state && !logViewed) {
    logViewed = true;
    renderStory();
  }
};
for (const t of tabs) {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(tabs.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
}

// ---------- Demo story ----------
// The video's story as a checklist for presenting: each step ticks itself off from the log.
let logViewed = false;
let logEpoch = null;
const happened = (pred) => state.log.some(pred);
const agentBusy = () => state.calls.some((c) => c.via === "demo agent" && ["paused", "running", "checking"].includes(c.status));
const undoableRename = () => state.calls.find((c) => c.tool === "rename_file" && c.undoable);

const STEPS = [
  {
    title: "Find the brief",
    sub: "Reads run on their own",
    done: () => happened((e) => e.event === "executed" && e.tool === "read_file"),
    run: () => api("/api/agent", { task: "brief" }),
  },
  {
    title: "Deny a delete",
    sub: "The agent asks to delete client-files/",
    done: () => happened((e) => e.event === "decided" && e.tool === "delete_folder" && e.decision === "denied"),
    run: () => api("/api/agent", { task: "delete" }),
  },
  {
    title: "Approve a rename",
    sub: "It runs, and stays reversible",
    done: () => happened((e) => e.event === "executed" && e.tool === "rename_file"),
    run: () => api("/api/agent", { task: "rename" }),
  },
  {
    title: "Undo the rename",
    sub: "Back to the original name",
    done: () => happened((e) => e.event === "undone" && e.tool === "rename_file"),
    ready: () => Boolean(undoableRename()),
    run: async () => {
      const c = undoableRename();
      if (!c) throw new Error("Do step 3 first: approve a rename.");
      const res = await api("/api/undo", { id: c.id });
      toast(res.text);
    },
  },
  {
    title: "Open the activity log",
    sub: "Who asked, who decided, what ran",
    done: () => logViewed,
    run: async () => {
      selectTab($("#tab-log"));
      $("#tab-log").focus();
    },
  },
];

const renderStory = () => {
  if (state.log[0]?.ts !== logEpoch) {
    logEpoch = state.log[0]?.ts;
    logViewed = false;
  }
  const busy = agentBusy();
  const states = STEPS.map((s) => s.done());
  const next = states.indexOf(false);
  $("#story-progress").textContent = next === -1 ? "All done" : `${states.filter(Boolean).length} of ${STEPS.length}`;
  $("#steps").replaceChildren(
    ...STEPS.map((s, i) => {
      const status = states[i] ? "done" : i === next ? "next" : "todo";
      const blocked = i < 4 && (busy || (s.ready && !s.ready()));
      return el(
        "li",
        { class: "step", "data-state": status },
        el("span", { class: "step-mark", "aria-hidden": "true" }, states[i] ? icon("check") : String(i + 1)),
        el("div", { class: "step-text" }, el("span", { class: "step-title", text: s.title }), el("span", { class: "step-sub", text: s.sub })),
        states[i]
          ? el("span", { class: "visually-hidden", text: "Done" })
          : el("button", { class: `btn btn-small ${status === "next" ? "btn-primary" : "btn-quiet"}`, type: "button", disabled: blocked, "aria-label": `Run step ${i + 1}: ${s.title}`, onclick: () => act(s.run) }, el("span", { text: "Run" })),
      );
    }),
  );
};

// ---------- Live state ----------
const conn = $("#conn");
let failures = 0;
const setConn = (s, text) => {
  conn.dataset.state = s;
  conn.querySelector(".conn-text").textContent = text;
};

const events = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);
events.addEventListener("open", () => {
  failures = 0;
  setConn("live", "Live");
});
events.addEventListener("error", () => {
  failures += 1;
  setConn(failures > 2 ? "offline" : "connecting", failures > 2 ? "Offline: reload the page" : "Reconnecting");
});
events.addEventListener("state", (e) => {
  state = JSON.parse(e.data);
  renderDecisions();
  renderCalls();
  renderLog();
  renderTree();
  renderPolicy();
  renderChat();
  renderStory();
  first = false;
});
