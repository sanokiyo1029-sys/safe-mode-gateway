import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c, display, mono, sans } from "../theme";
import { Bubble, ClassTag, Eyebrow, FileRow, Window } from "../ui";

// 0:00–0:45. Cue frames follow the narration sentences (see narration-timing.ts).
const HookInner = () => {
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
        <Interactive.Div
          name="Workspace"
          style={{
            position: "absolute",
            left: 120,
            top: 110,
            width: 700,
            height: 640,
            opacity: interpolate(frame, [15, 35, 1011, 1035], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [15, 45], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title="workspace /">
            <FileRow name="project-brief.md" />
            <FileRow name="meeting-notes.txt" />
            <Interactive.Div
              name="client-files rows"
              style={{
                borderRadius: 12,
                outline: "3px solid #F87171",
                outlineOffset: 4,
                outlineColor: frame >= 592 && frame < 908 && Math.floor(frame / 12) % 2 === 0 ? "#F87171" : "#F8717100",
                opacity: interpolate(frame, [908, 950], [1, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              <FileRow name="client-files/" folder />
              <FileRow name="contract.pdf" depth={1} />
              <FileRow name="invoices-2026/" folder depth={1} />
              <FileRow name="logo.png" depth={1} />
            </Interactive.Div>
            <Interactive.Div
              name="Gone label"
              style={{
                marginTop: 24,
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 700,
                color: c.danger,
                opacity: interpolate(frame, [930, 950], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              client-files/ deleted · 3 items gone
            </Interactive.Div>
          </Window>
        </Interactive.Div>

        <Interactive.Div
          name="Agent chat"
          style={{
            position: "absolute",
            left: 880,
            top: 110,
            width: 920,
            height: 380,
            opacity: interpolate(frame, [40, 60, 1011, 1035], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [40, 70], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title="Agent chat">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Interactive.Div
                name="User request"
                style={{
                  opacity: interpolate(frame, [140, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [140, 165], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <Bubble who="you">Find my project brief and summarize it.</Bubble>
              </Interactive.Div>
              <Interactive.Div
                name="Agent reply"
                style={{
                  opacity: interpolate(frame, [739, 755], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  translate: interpolate(frame, [739, 765], ["0px 20px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                }}
              >
                <Bubble who="agent">Done! The brief covers the Q4 client portal launch…</Bubble>
              </Interactive.Div>
            </div>
          </Window>
        </Interactive.Div>

        <Interactive.Div
          name="Tool list"
          style={{
            position: "absolute",
            left: 880,
            top: 530,
            width: 920,
            height: 340,
            opacity: interpolate(frame, [232, 250, 1011, 1035], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [232, 260], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          <Window title="Tools this agent can call">
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: mono, fontSize: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <ClassTag cls="read" /> search_files
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <ClassTag cls="read" /> read_file
              </div>
              <Interactive.Div
                name="Delete tool"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  color: c.danger,
                  opacity: interpolate(frame, [390, 410], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  scale: interpolate(frame, [390, 420], [1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1), output: "perceptual-scale" }),
                  transformOrigin: "0% 50%",
                }}
              >
                <ClassTag cls="destructive" /> delete_folder
                <Interactive.Span
                  name="Delete call"
                  style={{
                    marginLeft: 12,
                    fontSize: 24,
                    color: c.muted,
                    opacity: interpolate(frame, [592, 610], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  ← on &quot;client-files&quot;?
                </Interactive.Span>
              </Interactive.Div>
            </div>
          </Window>
        </Interactive.Div>
        <Interactive.Div
          name="Title"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            paddingBottom: 120,
            opacity: interpolate(frame, [1020, 1045], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            scale: interpolate(frame, [1020, 1060], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1), output: "perceptual-scale" }),
          }}
        >
          <Eyebrow>TRACK 1</Eyebrow>
          <div style={{ fontFamily: display, fontSize: 132, fontWeight: 900, color: c.text, letterSpacing: -1 }}>
            Safe-Mode Gateway
          </div>
          <Interactive.Div
            name="Tagline"
            style={{
              fontFamily: sans,
              fontSize: 48,
              color: "#DCE4FF",
              opacity: interpolate(frame, [1147, 1170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            Control what your AI agents can actually do.
          </Interactive.Div>
        </Interactive.Div>
      </Interactive.Div>
    </>
  );
};

export const Hook = Interactive.create({
  Component: HookInner,
  layout: "absolute-fill",
});
