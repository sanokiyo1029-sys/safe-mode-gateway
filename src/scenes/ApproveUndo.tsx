import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, mono, sans } from "../theme";
import { Button, ClassTag, Cursor, Field, FileRow, Status, ToolCall, VoiceChip, Window } from "../ui";

// 2:35–3:40
const ApproveUndoInner = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const renamed = frame >= 680 && frame < 1135;

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
            <div style={{ position: "relative" }}>
              <Interactive.Div
                name="Rename flash"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  backgroundColor: `${c.write}33`,
                  opacity: interpolate(frame, [680, 688, 740, 770, 1135, 1143, 1195, 1225], [0, 1, 1, 0, 0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              />
              <div style={{ display: "flex", alignItems: "center" }}>
                <FileRow name={renamed ? "final-brief.md" : "project-brief.md"} />
                <Interactive.Span
                  name="Draft tag"
                  style={{
                    marginLeft: 16,
                    fontFamily: sans,
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    padding: "5px 10px",
                    borderRadius: 8,
                    color: c.write,
                    border: `1.5px solid ${c.write}88`,
                    opacity: interpolate(frame, [996, 1010], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  STILL A DRAFT
                </Interactive.Span>
              </div>
            </div>
            <FileRow name="meeting-notes.txt" />
            <FileRow name="client-files/" folder />
            <FileRow name="contract.pdf" depth={1} />
            <FileRow name="invoices-2026/" folder depth={1} />
            <FileRow name="logo.png" depth={1} />
          </Window>
        </div>

        <Interactive.Div
          name="Undo toast"
          style={{
            position: "absolute",
            left: 120,
            top: 600,
            width: 560,
            padding: 24,
            boxSizing: "border-box",
            borderRadius: 18,
            backgroundColor: c.panel,
            border: `2px solid ${frame >= 1135 ? c.accent : c.write}`,
            fontFamily: sans,
            color: c.text,
            opacity: interpolate(frame, [700, 715, 1270, 1290], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [700, 730], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ fontSize: 27, lineHeight: 1.35, marginBottom: 16 }}>
            {frame >= 1135 ? "Restored project-brief.md" : "Renamed to final-brief.md"}
          </div>
          <div style={{ display: "flex", visibility: frame >= 1135 ? "hidden" : "visible" }}>
            <Button tone="ghost">Undo</Button>
          </div>
        </Interactive.Div>

        <div style={{ position: "absolute", left: 730, top: 100, width: 1070, height: 790 }}>
          <Window title="Safe-Mode Gateway · live tool calls" glow={c.accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Interactive.Div
                name="Rename call"
                style={{
                  opacity: interpolate(frame, [152, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [152, 180], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <ToolCall tool="rename_file" args="project-brief.md → final-brief.md" cls="write" />
              </Interactive.Div>
              <Interactive.Div
                name="Rename status"
                style={{
                  marginLeft: 40,
                  opacity: interpolate(frame, [200, 215], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <Status kind={frame >= 610 ? "approved" : "paused"} />
              </Interactive.Div>
              <Interactive.Div
                name="Undo call"
                style={{
                  marginTop: 20,
                  opacity: interpolate(frame, [1140, 1158], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [1140, 1168], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <ToolCall tool="rename_file" args="final-brief.md → project-brief.md" cls="write" />
              </Interactive.Div>
              <Interactive.Div
                name="Undo status"
                style={{
                  marginLeft: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: interpolate(frame, [1170, 1185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <Status kind="undone" />
                <span style={{ fontFamily: mono, fontSize: 22, color: c.muted }}>
                  original_name = &quot;project-brief.md&quot; (DynamoDB)
                </span>
              </Interactive.Div>
            </div>
          </Window>
        </div>

        <Interactive.Div
          name="Reversibility panel"
          style={{
            position: "absolute",
            left: 754,
            top: 560,
            width: 1022,
            height: 306,
            opacity: interpolate(frame, [1310, 1330], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [1310, 1340], ["0px 40px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title="Can it be undone?">
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: sans, fontSize: 26, color: c.text }}>
              <Interactive.Div
                name="Rename reversible"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `2px solid ${c.line}`,
                  opacity: interpolate(frame, [1395, 1410], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <span style={{ fontFamily: mono, width: 210 }}>rename_file</span>
                <span style={{ color: c.read, fontWeight: 700 }}>✓ Undo</span>
                <span style={{ color: c.muted }}>if the file is still in the expected state</span>
              </Interactive.Div>
              <Interactive.Div
                name="Email irreversible"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `2px solid ${frame >= 1775 ? c.danger : c.line}`,
                  opacity: interpolate(frame, [1598, 1613], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <span style={{ fontFamily: mono, width: 210 }}>send_email</span>
                <span style={{ color: c.danger, fontWeight: 700 }}>✕ No undo</span>
                <span style={{ color: c.muted }}>once it has been delivered</span>
              </Interactive.Div>
              <Interactive.Div
                name="Approval matters"
                style={{
                  marginTop: 4,
                  fontWeight: 700,
                  color: c.write,
                  opacity: interpolate(frame, [1775, 1795], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                For actions like these, the approval step is the safeguard.
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
            backgroundColor: "#2B2540",
            opacity: interpolate(frame, [276, 295, 640, 665], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
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
            border: `3px solid ${c.write}`,
            boxShadow: "0 40px 120px #2B254066",
            fontFamily: sans,
            color: c.text,
            opacity: interpolate(frame, [276, 295, 640, 665], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [276, 310], ["0px 40px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ position: "absolute", left: 36, top: -26 }}>
            <VoiceChip t={frame - 295} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 38, fontWeight: 800 }}>Approval needed</div>
            <ClassTag cls="write" />
          </div>
          <div style={{ position: "relative" }}>
            <Interactive.Div
              name="Highlight: current"
              style={{ position: "absolute", left: -14, right: -14, top: 64, height: 64, borderRadius: 10, backgroundColor: `${c.accent}26`, opacity: interpolate(frame, [330, 341, 395, 405], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}
            />
            <Interactive.Div
              name="Highlight: proposed"
              style={{ position: "absolute", left: -14, right: -14, top: 128, height: 64, borderRadius: 10, backgroundColor: `${c.accent}26`, opacity: interpolate(frame, [405, 416, 470, 480], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}
            />
            <Field label="Action">
              <span style={{ color: c.write, fontWeight: 700 }}>rename_file</span>
            </Field>
            <Field label="Current">project-brief.md</Field>
            <Field label="Proposed">
              <span style={{ color: c.read }}>final-brief.md</span>
            </Field>
            <Field label="Requested by">brief-assistant</Field>
          </div>
          <div style={{ position: "absolute", right: 36, bottom: 36, display: "flex", gap: 16 }}>
            <Button tone="deny">Deny</Button>
            <Button tone="approve">Approve</Button>
          </div>
          <Interactive.Div
            name="Approved stamp"
            style={{
              position: "absolute",
              left: 60,
              bottom: 40,
              padding: "6px 24px",
              borderRadius: 12,
              border: `5px solid ${c.read}`,
              color: c.read,
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: 6,
              rotate: "-8deg",
              opacity: interpolate(frame, [610, 617], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              scale: interpolate(frame, [610, 623], [1.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1), output: "perceptual-scale" }),
            }}
          >
            APPROVED
          </Interactive.Div>
        </Interactive.Div>

        <Interactive.Div
          name="Cursor"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: interpolate(frame, [530, 545, 640, 650, 1050, 1065, 1170, 1180], [0, 1, 1, 0, 0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [530, 590, 1050, 1110], ["1720px 900px", "1559px 665px", "700px 900px", "208px 705px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.2, 1) }),
            scale: interpolate(frame, [600, 606, 612, 1120, 1126, 1132], [1, 0.8, 1, 1, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Cursor />
        </Interactive.Div>
      </Interactive.Div>
    </>
  );
};

export const ApproveUndo = Interactive.create({
  Component: ApproveUndoInner,
  layout: "absolute-fill",
});
