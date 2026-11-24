import type React from "react";
import { Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import envelope from "./voice-envelope.json";
import timing from "./voice-timing.json";

// The narrator: a flat 2D cutout (public/presenter.png, head and shoulders, with
// the white sticker outline baked in). Her mouth opens with the voiceover's
// loudness (voice-envelope.json), and she hops at the start of each line.

const SRC_W = 840; // presenter.png size
const SRC_H = 680;
const WIDTH = 560;
const k = WIDTH / SRC_W;
const MOUTH = { x: 414, y: 392 }; // mouth line centre in presenter.png

const loudness = (frame: number, radius: number) => {
  let sum = 0;
  for (let f = frame - radius; f <= frame + radius; f++) sum += envelope[f] ?? 0;
  return sum / (radius * 2 + 1);
};

const lineStart = (frame: number) => {
  for (let i = timing.length - 1; i >= 0; i--) if (timing[i].start <= frame) return timing[i].start;
  return -99;
};

const PresenterInner = ({ style }: { readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const mouth = Math.min(1, loudness(frame, 1) * 1.15);
  const talk = loudness(frame, 6);
  const since = frame - lineStart(frame);
  const hop = since >= 0 && since < 10 ? -Math.sin((since / 10) * Math.PI) * 12 : 0;
  const breathe = Math.sin(frame / 22) * 3;
  const sway = Math.sin(frame / 47) * 0.8 + talk * Math.sin(frame / 9) * 1.2;
  const slideIn = interpolate(frame, [0, 35], [-520, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div style={style}>
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: SRC_H * k,
          translate: `${slideIn}px ${hop + breathe}px`,
          rotate: `${sway}deg`,
          transformOrigin: "50% 100%",
        }}
      >
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
    </div>
  );
};

export const Presenter = Interactive.create({
  Component: PresenterInner,
  layout: "none",
});
