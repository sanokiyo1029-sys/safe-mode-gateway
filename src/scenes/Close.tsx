import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, display, sans, sticker } from "../theme";
import { AuditTable, Eyebrow, FileRow, Window } from "../ui";

const num = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 96,
  height: 96,
  marginRight: 34,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  boxShadow: sticker,
} as const;

const chip = {
  width: 340,
  height: 76,
  borderRadius: 16,
  backgroundColor: c.panel,
  border: `2px solid ${c.line}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: sans,
  fontSize: 30,
  fontWeight: 600,
  color: c.text,
} as const;

// 4:30–5:00. The restored file and the audit trail stay visible behind the close.
const CloseInner = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Scene fade"
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [0, 12, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <Interactive.Div
          name="Evidence backdrop"
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [140, 170, 400, 430], [1, 0.1, 0.1, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div style={{ position: "absolute", left: 120, top: 100, width: 560, height: 260 }}>
            <Window title="workspace /">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <FileRow name="project-brief.md" />
                <span style={{ fontFamily: sans, fontSize: 22, fontWeight: 700, color: c.read }}>✓ restored</span>
              </div>
              <FileRow name="client-files/" folder />
            </Window>
          </div>
          <div style={{ position: "absolute", left: 120, top: 400, width: 1680, height: 540 }}>
            <Window title="Safe-Mode Gateway · activity log · DynamoDB">
              <AuditTable />
            </Window>
          </div>
        </Interactive.Div>

        <Interactive.Div
          name="Hub"
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [154, 175, 395, 420], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div style={{ position: "absolute", left: 140, top: 430, ...chip }}>MCP agents</div>
          <div style={{ position: "absolute", left: 480, top: 466, width: 290, height: 4, backgroundColor: c.line }} />
          <div style={{ position: "absolute", left: 1150, top: 466, width: 290, height: 4, backgroundColor: c.line }} />
          <div
            style={{
              position: "absolute",
              left: 770,
              top: 368,
              width: 380,
              height: 200,
              borderRadius: 20,
              backgroundColor: c.ink,
              border: `3px solid ${c.accent}`,
              boxShadow: `0 0 70px ${c.accent}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontSize: 36,
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            Safe-Mode Gateway
          </div>
          <Interactive.Div name="Tool: files" style={{ position: "absolute", left: 1440, top: 240, ...chip, opacity: interpolate(frame, [180, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            Files
          </Interactive.Div>
          <Interactive.Div name="Tool: cloud storage" style={{ position: "absolute", left: 1440, top: 336, ...chip, opacity: interpolate(frame, [205, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            Cloud storage
          </Interactive.Div>
          <Interactive.Div name="Tool: database" style={{ position: "absolute", left: 1440, top: 432, ...chip, opacity: interpolate(frame, [230, 245], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            Database
          </Interactive.Div>
          <Interactive.Div name="Tool: email" style={{ position: "absolute", left: 1440, top: 528, ...chip, opacity: interpolate(frame, [255, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            Email
          </Interactive.Div>
          <Interactive.Div
            name="Policy note"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 680,
              textAlign: "center",
              fontFamily: sans,
              fontSize: 36,
              color: c.muted,
              opacity: interpolate(frame, [290, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            Policies that match the actions each tool can take
          </Interactive.Div>
        </Interactive.Div>

        <Interactive.Div
          name="Questions"
          style={{
            position: "absolute",
            left: 200,
            top: 170,
            display: "flex",
            flexDirection: "column",
            gap: 40,
            fontFamily: display,
            color: c.text,
            opacity: interpolate(frame, [420, 440], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Eyebrow>IF AN AGENT CAN TOUCH YOUR TEAM’S WORKSPACE, ASK:</Eyebrow>
          <Interactive.Div
            name="Question 1"
            style={{
              fontSize: 84,
              fontWeight: 800,
              opacity: interpolate(frame, [598, 612], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [598, 625], ["0px 24px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            <span style={{ ...num, color: c.accent }}>1</span>What did it try to do?
          </Interactive.Div>
          <Interactive.Div
            name="Question 2"
            style={{
              fontSize: 84,
              fontWeight: 800,
              opacity: interpolate(frame, [675, 689], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [675, 702], ["0px 24px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            <span style={{ ...num, color: c.write }}>2</span>Who allowed it?
          </Interactive.Div>
          <Interactive.Div
            name="Question 3"
            style={{
              fontSize: 84,
              fontWeight: 800,
              opacity: interpolate(frame, [721, 735], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [721, 748], ["0px 24px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            <span style={{ ...num, color: c.read }}>3</span>What actually happened?
          </Interactive.Div>
          <Interactive.Div
            name="Lockup"
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              gap: 22,
              opacity: interpolate(frame, [767, 785], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth={1.8}>
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span style={{ fontSize: 52, fontWeight: 800 }}>Safe-Mode Gateway</span>
            <span style={{ fontSize: 36, color: c.muted }}>answers all three.</span>
          </Interactive.Div>
        </Interactive.Div>
      </Interactive.Div>
    </>
  );
};

export const Close = Interactive.create({
  Component: CloseInner,
  layout: "absolute-fill",
});
