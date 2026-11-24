import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, mono, sans } from "../theme";
import { Bubble, Button, ClassTag, Cursor, Field, FileRow, ToolCall, VoiceChip, Window } from "../ui";

// 1:35–2:35
const AllowBlockInner = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Scene fade"
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [0, 12, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ position: "absolute", left: 120, top: 100, width: 560, height: 470 }}>
          <Window title="workspace /">
            <FileRow name="project-brief.md" />
            <FileRow name="meeting-notes.txt" />
            <Interactive.Div
              name="client-files still here"
              style={{
                borderRadius: 12,
                outline: `3px solid ${c.read}`,
                outlineOffset: 4,
                outlineColor: frame >= 1359 ? c.read : "#34D39900",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <FileRow name="client-files/" folder />
                <Interactive.Span
                  name="Still here label"
                  style={{
                    marginLeft: 18,
                    fontFamily: sans,
                    fontSize: 24,
                    fontWeight: 700,
                    color: c.read,
                    opacity: interpolate(frame, [1365, 1385], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  ✓ still here
                </Interactive.Span>
              </div>
              <FileRow name="contract.pdf" depth={1} />
              <FileRow name="invoices-2026/" folder depth={1} />
              <FileRow name="logo.png" depth={1} />
            </Interactive.Div>
          </Window>
        </div>
        <Interactive.Div
          name="Refreshed label"
          style={{
            position: "absolute",
            left: 520,
            top: 113,
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 600,
            color: c.read,
            opacity: interpolate(frame, [1340, 1355], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          ↻ refreshed
        </Interactive.Div>

        <div style={{ position: "absolute", left: 120, top: 600, width: 560, height: 290 }}>
          <Window title="Agent chat">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Interactive.Div
                name="User request"
                style={{
                  opacity: interpolate(frame, [81, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [81, 106], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <Bubble who="you">Find the project brief.</Bubble>
              </Interactive.Div>
              <Interactive.Div
                name="Agent reply"
                style={{
                  opacity: interpolate(frame, [260, 275], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [260, 285], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <Bubble who="agent">Found it: project-brief.md</Bubble>
              </Interactive.Div>
            </div>
          </Window>
        </div>

        <div style={{ position: "absolute", left: 730, top: 100, width: 1070, height: 790 }}>
          <Window title="Safe-Mode Gateway · live tool calls" glow={c.accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Interactive.Div
                name="Search call"
                style={{
                  opacity: interpolate(frame, [147, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [147, 175], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <ToolCall tool="search_files" args='query: "project brief"' cls="read" status={frame >= 190 ? "allowed" : undefined} />
              </Interactive.Div>
              <Interactive.Div
                name="Search result"
                style={{
                  marginLeft: 40,
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: `1.5px dashed ${c.line}`,
                  fontFamily: sans,
                  fontSize: 25,
                  color: c.muted,
                  opacity: interpolate(frame, [230, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                ↳ 1 result · <span style={{ fontFamily: mono, color: c.text }}>project-brief.md</span> · “Q4 client portal launch: scope, timeline, owners.”
              </Interactive.Div>
              <Interactive.Div
                name="Delete call"
                style={{
                  marginTop: 14,
                  opacity: interpolate(frame, [567, 585], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [567, 595], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <ToolCall
                  tool="delete_folder"
                  args='"client-files"'
                  cls="destructive"
                  status={frame >= 1255 ? "denied" : frame >= 681 ? "paused" : undefined}
                />
              </Interactive.Div>
              <Interactive.Div
                name="Held note"
                style={{
                  marginLeft: 40,
                  fontFamily: sans,
                  fontSize: 25,
                  fontWeight: 600,
                  color: c.write,
                  opacity: interpolate(frame, [700, 720], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                ⛔ Held at the gateway. The file tool was not called.
              </Interactive.Div>
            </div>
          </Window>
        </div>

        <Interactive.Div
          name="Trigger button"
          style={{
            position: "absolute",
            left: 1460,
            top: 106,
            height: 44,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            borderRadius: 10,
            fontFamily: sans,
            fontSize: 21,
            fontWeight: 700,
            color: c.danger,
            border: `2px solid ${c.danger}88`,
            backgroundColor: frame >= 440 ? "#3A1518" : c.panel2,
            opacity: interpolate(frame, [345, 365], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          ▶ Demo: trigger delete request
        </Interactive.Div>

        <Interactive.Div
          name="Activity log"
          style={{
            position: "absolute",
            left: 754,
            top: 560,
            width: 1022,
            height: 306,
            opacity: interpolate(frame, [1437, 1457], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [1437, 1467], ["0px 40px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title="Activity log · DynamoDB">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: sans, fontSize: 23, color: c.text, whiteSpace: "nowrap" }}>
              <Interactive.Div
                name="Log: search"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `2px solid ${frame >= 1575 && frame < 1629 ? c.read : c.line}`,
                }}
              >
                <span style={{ fontFamily: mono, color: c.muted }}>10:02:14</span>
                <span style={{ fontFamily: mono, width: 220 }}>search_files</span>
                <ClassTag cls="read" />
                <span style={{ color: c.muted }}>auto-allowed</span>
                <span style={{ color: c.read, fontWeight: 700 }}>→ ran</span>
              </Interactive.Div>
              <Interactive.Div
                name="Log: delete"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `2px solid ${frame >= 1629 ? c.danger : c.line}`,
                  opacity: interpolate(frame, [1480, 1495], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <span style={{ fontFamily: mono, color: c.muted }}>10:02:31</span>
                <span style={{ fontFamily: mono, width: 220 }}>delete_folder</span>
                <ClassTag cls="destructive" />
                <span style={{ color: c.muted }}>denied by operator</span>
                <span style={{ color: c.danger, fontWeight: 700 }}>→ not executed</span>
              </Interactive.Div>
            </div>
          </Window>
        </Interactive.Div>

        <Interactive.Div
          name="Approval backdrop"
          style={{
            position: "absolute",
            left: 730,
            top: 100,
            width: 1070,
            height: 790,
            borderRadius: 20,
            backgroundColor: "#05070C",
            opacity: interpolate(frame, [831, 850, 1300, 1325], [0, 0.65, 0.65, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />
        <Interactive.Div
          name="Approval card"
          style={{
            position: "absolute",
            left: 840,
            top: 220,
            width: 860,
            height: 520,
            padding: 36,
            boxSizing: "border-box",
            borderRadius: 22,
            backgroundColor: c.panel,
            border: `3px solid ${c.danger}`,
            boxShadow: "0 40px 120px #000000B0",
            fontFamily: sans,
            color: c.text,
            opacity: interpolate(frame, [831, 850, 1300, 1325], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [831, 865], ["0px 40px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ position: "absolute", left: 36, top: -26 }}>
            <VoiceChip t={frame - 850} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 38, fontWeight: 800 }}>Approval needed</div>
            <ClassTag cls="destructive" />
          </div>
          <div style={{ position: "relative" }}>
            <Interactive.Div
              name="Highlight: action"
              style={{ position: "absolute", left: -14, right: -14, top: 0, height: 64, borderRadius: 10, backgroundColor: `${c.accent}26`, opacity: interpolate(frame, [909, 920, 955, 965], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}
            />
            <Interactive.Div
              name="Highlight: target"
              style={{ position: "absolute", left: -14, right: -14, top: 64, height: 64, borderRadius: 10, backgroundColor: `${c.accent}26`, opacity: interpolate(frame, [965, 976, 1025, 1035], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}
            />
            <Interactive.Div
              name="Highlight: agent"
              style={{ position: "absolute", left: -14, right: -14, top: 128, height: 64, borderRadius: 10, backgroundColor: `${c.accent}26`, opacity: interpolate(frame, [1035, 1046, 1095, 1105], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}
            />
            <Field label="Action">
              <span style={{ color: c.danger, fontWeight: 700 }}>delete_folder</span>
            </Field>
            <Field label="Target">
              /workspace/client-files <span style={{ color: c.muted, fontSize: 23 }}>· 3 items</span>
            </Field>
            <Field label="Requested by">brief-assistant</Field>
          </div>
          <div style={{ position: "absolute", right: 36, bottom: 36, display: "flex", gap: 16 }}>
            <Button tone="deny">Deny</Button>
            <Button tone="approve">Approve</Button>
          </div>
          <Interactive.Div
            name="Denied stamp"
            style={{
              position: "absolute",
              left: 60,
              bottom: 40,
              padding: "6px 24px",
              borderRadius: 12,
              border: `5px solid ${c.danger}`,
              color: c.danger,
              fontSize: 58,
              fontWeight: 800,
              letterSpacing: 6,
              rotate: "-8deg",
              opacity: interpolate(frame, [1255, 1262], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              scale: interpolate(frame, [1255, 1268], [1.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1), output: "perceptual-scale" }),
            }}
          >
            DENIED
          </Interactive.Div>
        </Interactive.Div>

        <Interactive.Div
          name="Cursor"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: interpolate(frame, [380, 395, 470, 480, 1180, 1195, 1290, 1300], [0, 1, 1, 0, 0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [380, 430, 1180, 1233], ["1720px 420px", "1552px 123px", "1620px 900px", "1367px 663px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.2, 1) }),
            scale: interpolate(frame, [440, 446, 452, 1245, 1251, 1257], [1, 0.8, 1, 1, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Cursor />
        </Interactive.Div>
      </Interactive.Div>
    </>
  );
};

export const AllowBlock = Interactive.create({
  Component: AllowBlockInner,
  layout: "absolute-fill",
});
