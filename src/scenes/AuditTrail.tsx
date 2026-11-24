import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, mono, sans } from "../theme";
import { AuditTable, Eyebrow, Window } from "../ui";

// 3:40–4:30. Table sits at left 120 / top 160; rows start 304px down, 92px each.
const AuditTrailInner = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const query = "client-files".slice(0, Math.max(0, Math.floor((frame - 990) / 4)));

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
        <Interactive.Div name="Heading" style={{ position: "absolute", left: 120, top: 96 }}>
          <Eyebrow>ACTIVITY LOG · WHAT YOUR TEAMMATE SEES</Eyebrow>
        </Interactive.Div>
        <Interactive.Div
          name="Log search"
          style={{
            position: "absolute",
            left: 1380,
            top: 84,
            width: 420,
            height: 56,
            padding: "0 20px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderRadius: 12,
            backgroundColor: c.panel,
            border: `2px solid ${c.accent}`,
            fontFamily: mono,
            fontSize: 25,
            color: c.text,
            opacity: interpolate(frame, [968, 985], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <span style={{ color: c.muted }}>search:</span> {query}
        </Interactive.Div>

        <Interactive.Div
          name="Log window"
          style={{
            position: "absolute",
            left: 120,
            top: 160,
            width: 1680,
            height: 540,
            opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [15, 45], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title="Safe-Mode Gateway · activity log · DynamoDB">
            <AuditTable />
          </Window>
        </Interactive.Div>

        <Interactive.Div name="Row 1 highlight" style={{ position: "absolute", left: 144, top: 304, width: 1620, height: 92, backgroundColor: `${c.read}1F`, borderLeft: `5px solid ${c.read}`, opacity: interpolate(frame, [307, 318, 375, 385], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
        <Interactive.Div name="Row 2 highlight" style={{ position: "absolute", left: 144, top: 396, width: 1620, height: 92, backgroundColor: `${c.danger}1F`, borderLeft: `5px solid ${c.danger}`, opacity: interpolate(frame, [385, 396, 496, 506, 1089, 1100], [0, 1, 1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
        <Interactive.Div name="Row 3 highlight" style={{ position: "absolute", left: 144, top: 488, width: 1620, height: 92, backgroundColor: `${c.write}1F`, borderLeft: `5px solid ${c.write}`, opacity: interpolate(frame, [506, 517, 602, 612], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
        <Interactive.Div name="Row 4 highlight" style={{ position: "absolute", left: 144, top: 580, width: 1620, height: 92, backgroundColor: `${c.accent}1F`, borderLeft: `5px solid ${c.accent}`, opacity: interpolate(frame, [612, 623, 723, 733], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />

        <Interactive.Div name="Filter: row 1" style={{ position: "absolute", left: 144, top: 304, width: 1620, height: 92, backgroundColor: c.panel, opacity: interpolate(frame, [1089, 1105], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
        <Interactive.Div name="Filter: rows 3-4" style={{ position: "absolute", left: 144, top: 488, width: 1620, height: 184, backgroundColor: c.panel, opacity: interpolate(frame, [1089, 1105], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />

        <Interactive.Div name="Column: request" style={{ position: "absolute", left: 504, top: 712, width: 580, fontFamily: sans, fontSize: 30, fontWeight: 700, color: c.accent, borderTop: `4px solid ${c.accent}`, paddingTop: 12, opacity: interpolate(frame, [733, 750, 945, 965], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          What was requested
        </Interactive.Div>
        <Interactive.Div name="Column: decision" style={{ position: "absolute", left: 1274, top: 712, width: 260, fontFamily: sans, fontSize: 30, fontWeight: 700, color: c.write, borderTop: `4px solid ${c.write}`, paddingTop: 12, opacity: interpolate(frame, [800, 817, 945, 965], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          What was decided
        </Interactive.Div>
        <Interactive.Div name="Column: outcome" style={{ position: "absolute", left: 1544, top: 712, width: 220, fontFamily: sans, fontSize: 30, fontWeight: 700, color: c.read, borderTop: `4px solid ${c.read}`, paddingTop: 12, opacity: interpolate(frame, [870, 887, 945, 965], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          What happened
        </Interactive.Div>

        <div style={{ position: "absolute", left: 120, top: 740, width: 1680, display: "flex", gap: 24, fontFamily: sans, fontSize: 28, fontWeight: 600, whiteSpace: "nowrap" }}>
          <Interactive.Div name="Check: reached gateway" style={{ flex: 1, padding: "20px 24px", borderRadius: 14, backgroundColor: c.panel, border: `2px solid ${c.line}`, color: c.text, opacity: interpolate(frame, [1120, 1135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            ✓ Request reached the gateway
          </Interactive.Div>
          <Interactive.Div name="Check: decision" style={{ flex: 1, padding: "20px 24px", borderRadius: 14, backgroundColor: c.panel, border: `2px solid ${c.line}`, color: c.text, opacity: interpolate(frame, [1210, 1225], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            ✓ Decided by: <span style={{ color: c.danger }}>operator · denied</span>
          </Interactive.Div>
          <Interactive.Div name="Check: tool ran" style={{ flex: 1, padding: "20px 24px", borderRadius: 14, backgroundColor: c.panel, border: `2px solid ${c.line}`, color: c.text, opacity: interpolate(frame, [1300, 1315], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            ✓ Tool actually ran: <span style={{ color: c.danger }}>no</span>
          </Interactive.Div>
        </div>
      </Interactive.Div>
    </>
  );
};

export const AuditTrail = Interactive.create({
  Component: AuditTrailInner,
  layout: "absolute-fill",
});
