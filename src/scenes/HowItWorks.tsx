import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, mono, sans } from "../theme";
import { ClassTag, Eyebrow, ToolCall, Window } from "../ui";

const box = {
  borderRadius: 20,
  backgroundColor: c.panel,
  border: `2px solid ${c.line}`,
  fontFamily: sans,
  color: c.text,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
} as const;

const aws = "#FF9900";

// The sponsor services behind the gateway (see ARCHITECTURE.md), popping in after it appears.
const services = [
  { job: "Log", name: "DynamoDB", dot: aws, at: 250 },
  { job: "Undo", name: "S3", dot: aws, at: 262 },
  { job: "Voice", name: "ElevenLabs", dot: "#FFFFFF", at: 274 },
];

const serviceChip = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 16px",
  borderRadius: 999,
  backgroundColor: "#161B45",
  border: "2px solid #FFFFFF",
  boxShadow: "0 8px 18px #0A1A6E55",
  fontFamily: sans,
  fontSize: 21,
  fontWeight: 600,
  color: c.text,
  whiteSpace: "nowrap",
} as const;

const Card = ({
  cls,
  title,
  body,
  example,
}: {
  readonly cls: "read" | "write" | "destructive";
  readonly title: string;
  readonly body: string;
  readonly example: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: sans }}>
    <div>
      <ClassTag cls={cls} />
    </div>
    <div style={{ fontSize: 40, fontWeight: 700, color: c.text }}>{title}</div>
    <div style={{ fontSize: 27, color: c.muted }}>{body}</div>
    <div style={{ fontFamily: mono, fontSize: 25, color: c.text }}>{example}</div>
  </div>
);

// 0:45–1:35
const HowItWorksInner = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const reads = Math.max(0, Math.min(10, Math.floor((frame - 1180) / 12) + 1));

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
        <Interactive.Div
          name="MCP connection line"
          style={{
            position: "absolute",
            left: 520,
            top: 248,
            width: 880,
            height: 4,
            backgroundColor: c.line,
            opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />
        <Interactive.Div
          name="Packet"
          style={{
            position: "absolute",
            left: 0,
            top: 236,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: c.accent,
            boxShadow: `0 0 30px ${c.accent}`,
            opacity: interpolate(frame, [328, 335, 455, 470], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [328, 368, 420, 460], ["507px 0px", "757px 0px", "1137px 0px", "1387px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />

        <Interactive.Div
          name="Agent box"
          style={{
            position: "absolute",
            left: 140,
            top: 150,
            width: 380,
            height: 200,
            opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [15, 45], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ ...box, width: "100%", height: "100%" }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>MCP agent</div>
            <div style={{ fontFamily: mono, fontSize: 24, color: c.muted }}>brief-assistant</div>
          </div>
        </Interactive.Div>

        <Interactive.Div
          name="Tool: file search"
          style={{
            position: "absolute",
            left: 1400,
            top: 110,
            width: 380,
            height: 80,
            opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [40, 70], ["30px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ ...box, width: "100%", height: "100%", fontSize: 30, fontWeight: 600 }}>File search</div>
        </Interactive.Div>
        <Interactive.Div
          name="Tool: cloud storage"
          style={{
            position: "absolute",
            left: 1400,
            top: 210,
            width: 380,
            height: 80,
            opacity: interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [75, 105], ["30px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ ...box, width: "100%", height: "100%", fontSize: 30, fontWeight: 600 }}>Cloud storage</div>
        </Interactive.Div>
        <Interactive.Div
          name="Tool: database"
          style={{
            position: "absolute",
            left: 1400,
            top: 310,
            width: 380,
            height: 80,
            opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [110, 140], ["30px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <div style={{ ...box, width: "100%", height: "100%", fontSize: 30, fontWeight: 600 }}>Database</div>
        </Interactive.Div>

        <Interactive.Div
          name="Gateway box"
          style={{
            position: "absolute",
            left: 770,
            top: 120,
            width: 380,
            height: 260,
            opacity: interpolate(frame, [211, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            scale: interpolate(frame, [211, 250], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1), output: "perceptual-scale" }),
          }}
        >
          <div
            style={{
              ...box,
              width: "100%",
              height: "100%",
              border: `3px solid ${c.accent}`,
              boxShadow: `0 0 70px ${c.accent}40`,
              backgroundColor: "#141B33",
            }}
          >
            <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth={1.8}>
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <div style={{ fontSize: 36, fontWeight: 800, textAlign: "center", lineHeight: 1.15 }}>
              Safe-Mode
              <br />
              Gateway
            </div>
            <div style={{ fontFamily: mono, fontSize: 20, color: aws }}>on AWS Lambda</div>
          </div>
        </Interactive.Div>
        <Interactive.Div
          name="Sponsor services"
          style={{ position: "absolute", left: 960, top: 366, translate: "-50% 0", display: "flex", gap: 12 }}
        >
          {services.map((s) => (
            <div
              key={s.name}
              style={{
                ...serviceChip,
                opacity: interpolate(frame, [s.at, s.at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                scale: interpolate(frame, [s.at, s.at + 14], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) }),
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.dot }} />
              {s.job} · <b>{s.name}</b>
            </div>
          ))}
        </Interactive.Div>
        <Interactive.Div
          name="Checked label"
          style={{
            position: "absolute",
            left: 690,
            top: 438,
            width: 540,
            textAlign: "center",
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 600,
            color: "#DCE4FF",
            opacity: interpolate(frame, [370, 390], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Every call is checked before it runs
        </Interactive.Div>

        <Interactive.Div
          name="Classes heading"
          style={{
            position: "absolute",
            left: 120,
            top: 470,
            opacity: interpolate(frame, [490, 510], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Eyebrow>THREE CLASSES OF TOOL CALL</Eyebrow>
        </Interactive.Div>
        <Interactive.Div
          name="Policy heading"
          style={{
            position: "absolute",
            right: 120,
            top: 470,
            opacity: interpolate(frame, [858, 878], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Eyebrow color={c.write}>POLICY · SET BY THE OPERATOR</Eyebrow>
        </Interactive.Div>

        <Interactive.Div
          name="Class cards"
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [1154, 1175], [1, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Interactive.Div
            name="Read card"
            style={{
              position: "absolute",
              left: 120,
              top: 520,
              width: 540,
              height: 330,
              padding: 32, boxSizing: "border-box",
              borderRadius: 20,
              backgroundColor: c.panel,
              border: `2px solid ${c.read}55`,
              opacity: interpolate(frame, [574, 594], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [574, 604], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            <Card cls="read" title="Retrieve information" body="Look, don't touch." example="search_files · read_file" />
            <Interactive.Div
              name="Read policy"
              style={{
                marginTop: 26,
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 700,
                color: c.read,
                opacity: interpolate(frame, [931, 950], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              ✓ Runs automatically
            </Interactive.Div>
          </Interactive.Div>
          <Interactive.Div
            name="Write card"
            style={{
              position: "absolute",
              left: 690,
              top: 520,
              width: 540,
              height: 330,
              padding: 32, boxSizing: "border-box",
              borderRadius: 20,
              backgroundColor: c.panel,
              border: `2px solid ${c.write}55`,
              opacity: interpolate(frame, [635, 655], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [635, 665], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            <Card cls="write" title="Change something" body="Like renaming a file." example="rename_file" />
            <Interactive.Div
              name="Write policy"
              style={{
                marginTop: 26,
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 700,
                color: c.write,
                opacity: interpolate(frame, [1037, 1056], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              ⏸ Pauses for a decision
            </Interactive.Div>
          </Interactive.Div>
          <Interactive.Div
            name="Destructive card"
            style={{
              position: "absolute",
              left: 1260,
              top: 520,
              width: 540,
              height: 330,
              padding: 32, boxSizing: "border-box",
              borderRadius: 20,
              backgroundColor: c.panel,
              border: `2px solid ${c.danger}55`,
              opacity: interpolate(frame, [741, 761], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [741, 771], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            <Card cls="destructive" title="Can remove data" body="Like deleting a folder." example="delete_folder" />
            <Interactive.Div
              name="Destructive policy"
              style={{
                marginTop: 26,
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 700,
                color: c.write,
                opacity: interpolate(frame, [1037, 1056], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              ⏸ Pauses for a decision
            </Interactive.Div>
          </Interactive.Div>
        </Interactive.Div>

        <Interactive.Div
          name="Activity panel"
          style={{
            position: "absolute",
            left: 300,
            top: 500,
            width: 1320,
            height: 390,
            opacity: interpolate(frame, [1160, 1180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [1160, 1190], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title={`Gateway activity · ${reads} reads · 0 clicks`} glow={c.accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 244,
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                    borderRadius: 10,
                    fontFamily: mono,
                    fontSize: 19,
                    color: c.read,
                    backgroundColor: `${c.read}14`,
                    border: `1.5px solid ${c.read}44`,
                    opacity: i < reads ? 1 : 0,
                  }}
                >
                  ✓ search_files #{i + 1}
                </div>
              ))}
            </div>
            <Interactive.Div
              name="Paused write"
              style={{
                marginTop: 22,
                opacity: interpolate(frame, [1330, 1350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                translate: interpolate(frame, [1330, 1360], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              <ToolCall tool="rename_file" args='"project-brief.md"' cls="write" status="paused" />
            </Interactive.Div>
          </Window>
        </Interactive.Div>
      </Interactive.Div>
    </>
  );
};

export const HowItWorks = Interactive.create({
  Component: HowItWorksInner,
  layout: "absolute-fill",
});
