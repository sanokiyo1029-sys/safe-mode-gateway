import type React from "react";
import { Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import envelope from "./voice-envelope.json";
import timing from "./voice-timing.json";
import { c, display } from "./theme";

// The narrator: a flat 2D cutout (public/presenter.png, head and shoulders, with the
// sticker outline baked in). Her mouth opens with the voiceover's loudness, she turns
// (a 3D mirror flip) at every new scene, and at each line she squashes, hops and pops a
// small icon above her head, like the pose changes in the reference reel.

const SRC_W = 840; // presenter.png size
const SRC_H = 680;
const WIDTH = 560;
const k = WIDTH / SRC_W;
const MOUTH = { x: 414, y: 392 }; // mouth line centre in presenter.png
const SCENE_STARTS = [0, 1350, 2850, 4650, 6600, 8100];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const iconOf = (text: string, i: number) => {
  if (/\?$/.test(text)) return "?";
  if (/delet|riskier|denied|gone|problem|impossible|too quickly|draft/i.test(text)) return "!";
  if (/still here|approve this|automatically|restored|completed|all three|allows it/i.test(text)) return "✦";
  return i % 5 === 0 ? "♪" : "";
};
const icons = timing.map((line, i) => iconOf(line.text, i));

const loudness = (frame: number, radius: number) => {
  let sum = 0;
  for (let f = frame - radius; f <= frame + radius; f++) sum += envelope[f] ?? 0;
  return sum / (radius * 2 + 1);
};

const lineAt = (frame: number) => {
  for (let i = timing.length - 1; i >= 0; i--) if (timing[i].start <= frame) return i;
  return -1;
};

const PresenterInner = ({ style }: { readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const mouth = Math.min(1, loudness(frame, 1) * 1.15);
  const talk = loudness(frame, 6);

  const scene = SCENE_STARTS.filter((s) => s <= frame).length - 1;
  const turnT = interpolate(frame - SCENE_STARTS[scene], [0, 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const turn = scene === 0 ? 0 : (scene - 1) * 180 + 180 * turnT;

  const line = lineAt(frame);
  const since = line >= 0 ? frame - timing[line].start : 99;
  const squash = since < 12 ? Math.sin((since / 12) * Math.PI) : 0;
  const hop = -squash * 14;
  const breathe = Math.sin(frame / 22) * 3;
  const sway = Math.sin(frame / 47) * 0.8 + talk * Math.sin(frame / 9) * 1.2;
  const slideIn = interpolate(frame, [0, 35], [-620, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const icon = line >= 0 ? icons[line] : "";

  return (
    <div style={{ ...style, perspective: 1100 }}>
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: SRC_H * k,
          translate: `${slideIn}px ${hop + breathe}px`,
          rotate: `${sway}deg`,
          transformOrigin: "50% 100%",
          scale: `${1 - 0.05 * squash} ${1 + 0.06 * squash}`,
        }}
      >
        {/* Turns around her face (43% across) so the mirrored pose stays clear of the scenes. */}
        <div style={{ position: "absolute", inset: 0, rotate: `y ${turn}deg`, transformOrigin: "43% 50%" }}>
          <Img src={staticFile("presenter.png")} style={{ width: "100%", height: "100%", display: "block" }} />
          {mouth > 0.08 ? (
            <div
              style={{
                position: "absolute",
                left: MOUTH.x * k,
                top: MOUTH.y * k,
                width: (16 + mouth * 8) * k,
                height: (3 + mouth * 13) * k,
                translate: "-50% -40%",
                borderRadius: "50%",
                backgroundColor: "#5A2230",
              }}
            />
          ) : null}
        </div>
        {icon && since < 45 ? (
          <div
            style={{
              position: "absolute",
              left: WIDTH * 0.5,
              top: -6,
              width: 64,
              height: 64,
              translate: "-50% -50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 32,
              backgroundColor: c.paper,
              border: `3px solid ${c.ink}`,
              boxShadow: `0 0 0 4px ${c.lilac}, 0 10px 20px #6D678155`,
              fontFamily: display,
              fontSize: 40,
              fontWeight: 900,
              color: icon === "!" ? c.danger : c.accent,
              scale: interpolate(since, [0, 8, 12], [0, 1.25, 1], clamp),
              opacity: interpolate(since, [34, 45], [1, 0], clamp),
              rotate: `${Math.sin(since / 3) * 10}deg`,
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const Presenter = Interactive.create({
  Component: PresenterInner,
  layout: "none",
});
