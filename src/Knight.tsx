import type React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import envelope from "./voice-envelope.json";
import timing from "./voice-timing.json";
import { c } from "./theme";

// The narrator: an original knight who guards the gateway (its shield-check
// emblem is on her breastplate and shield), drawn as a white-outlined sticker.
// Her mouth follows the voiceover's loudness per frame (voice-envelope.json),
// and each narration line (voice-timing.json) gives her a mood and a small hop.

const hair = "#1C2133";
const skin = "#F2C7A5";
const skinShade = "#D9A585";

type Mood = "neutral" | "happy" | "wink" | "serious" | "curious" | "surprised";

const moodOf = (text: string, i: number): Mood => {
  if (/\?$/.test(text)) return "curious";
  if (/suppose|imagine|Look at|trigger a delete/i.test(text)) return "surprised";
  if (/delet|gone|riskier|impossible|disappeared|problem|too quickly|draft/i.test(text)) return "serious";
  if (/still here|all three|automatically|approve this|restored|completed|hit Deny/i.test(text)) return "happy";
  return (["neutral", "happy", "neutral", "wink"] as const)[i % 4];
};
const moods = timing.map((line, i) => moodOf(line.text, i));

const lineAt = (frame: number) => {
  for (let i = timing.length - 1; i >= 0; i--) if (timing[i].start <= frame) return i;
  return -1;
};

const loudness = (frame: number, radius: number) => {
  let sum = 0;
  for (let f = frame - radius; f <= frame + radius; f++) sum += envelope[f] ?? 0;
  return sum / (radius * 2 + 1);
};

const Eye = ({ x, open, closed }: { readonly x: number; readonly open: number; readonly closed: boolean }) =>
  closed ? (
    <path d={`M${x - 15} 199 Q${x} 185 ${x + 15} 199`} stroke="#1A1E2E" strokeWidth={4} fill="none" strokeLinecap="round" />
  ) : (
    <g style={{ transformBox: "fill-box", transformOrigin: "50% 60%", scale: `1 ${open}` }}>
      <path d={`M${x - 15} 196 Q${x} 184 ${x + 15} 196 Q${x} 204 ${x - 15} 196 Z`} fill="#F7F8FC" />
      <circle cx={x} cy={195} r={7.5} fill="#3A4C8F" />
      <circle cx={x} cy={195} r={3.6} fill="#0E1222" />
      <circle cx={x + 3} cy={192} r={2} fill="#FFFFFF" />
      <path d={`M${x - 16} 196 Q${x} 182 ${x + 16} 195`} stroke="#1A1E2E" strokeWidth={3.4} fill="none" strokeLinecap="round" />
    </g>
  );

// Brow paths per mood: [left, right].
const brows: Record<Mood, [string, string]> = {
  neutral: ["M140 173 L169 179", "M191 179 L220 173"],
  happy: ["M140 167 Q155 162 169 168", "M191 168 Q205 162 220 167"],
  wink: ["M140 173 L169 179", "M191 170 Q205 163 220 167"],
  serious: ["M140 168 L169 182", "M191 182 L220 168"],
  curious: ["M140 175 L169 179", "M191 168 Q207 158 222 162"],
  surprised: ["M140 165 Q155 157 169 164", "M191 164 Q205 157 220 165"],
};

const idleMouth: Record<Mood, React.ReactNode> = {
  neutral: <path d="M170 243 Q180 248 190 243" stroke="#8E4150" strokeWidth={3} fill="none" strokeLinecap="round" />,
  happy: <path d="M166 240 Q180 255 194 240" stroke="#8E4150" strokeWidth={3.4} fill="none" strokeLinecap="round" />,
  wink: <path d="M168 242 Q182 252 194 240" stroke="#8E4150" strokeWidth={3.4} fill="none" strokeLinecap="round" />,
  serious: <path d="M171 245 L189 245" stroke="#8E4150" strokeWidth={3} fill="none" strokeLinecap="round" />,
  curious: <path d="M171 244 Q181 247 190 242" stroke="#8E4150" strokeWidth={3} fill="none" strokeLinecap="round" />,
  surprised: <ellipse cx={180} cy={245} rx={5} ry={6.5} fill="#6B2533" />,
};

const KnightInner = ({ style }: { readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const line = lineAt(frame);
  const mood: Mood = line >= 0 ? moods[line] : "neutral";
  const sinceLine = line >= 0 ? frame - timing[line].start : 99;
  const hop = sinceLine < 10 ? -Math.sin((sinceLine / 10) * Math.PI) * 12 : 0;

  const mouth = Math.min(1, loudness(frame, 1) * 1.15);
  const talk = loudness(frame, 6);
  const breathe = Math.sin(frame / 22) * 3;
  const blink = frame % 104 < 5 ? 0.12 : 1;
  const eyeScale = mood === "serious" ? 0.8 : mood === "surprised" ? 1.18 : 1;
  const tilt = Math.sin(frame / 47) * 2 + talk * Math.sin(frame / 9) * 1.6 + (mood === "curious" ? 5 : 0);
  const sway = Math.sin(frame / 18) * 5 + 2;

  return (
    <div style={style}>
      <svg
        width={430}
        height={621}
        viewBox="0 0 360 520"
        style={{
          display: "block",
          overflow: "visible",
          translate: `${interpolate(frame, [0, 35], [-460, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px ${hop}px`,
        }}
      >
        <defs>
          <linearGradient id="kn-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DCE3F1" />
            <stop offset="1" stopColor="#8F9AB8" />
          </linearGradient>
          <linearGradient id="kn-steel-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C2CBE0" />
            <stop offset="1" stopColor="#7D88A6" />
          </linearGradient>
          <filter id="kn-sticker" x="-15%" y="-15%" width="130%" height="130%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={6} result="grow" />
            <feGaussianBlur in="grow" stdDeviation={9} result="blur" />
            <feOffset in="blur" dy={12} result="drop" />
            <feFlood floodColor="#0A1A6E" floodOpacity={0.45} />
            <feComposite in2="drop" operator="in" result="shadow" />
            <feFlood floodColor="#FFFFFF" />
            <feComposite in2="grow" operator="in" result="ring" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="ring" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#kn-sticker)">
          <g transform={`translate(0 ${breathe})`}>
            <path d="M70 360 C 58 420, 40 470, 18 530 L 342 530 C 320 470, 302 420, 290 360 Z" fill="#262B5E" />
            <path d="M118 332 Q180 302 242 332 L254 366 L106 366 Z" fill="#30367A" />

            <g transform={`rotate(${tilt} 180 300)`}>
              <g transform={`rotate(${sway} 222 128)`}>
                <path d="M214 118 C 286 112, 318 210, 292 330 C 286 360, 270 372, 262 360 C 278 300, 262 220, 206 150 Z" fill={hair} />
                <path d="M238 140 C 276 170, 288 240, 280 312" stroke="#2E3550" strokeWidth={4} fill="none" strokeLinecap="round" />
              </g>
              <ellipse cx={180} cy={180} rx={86} ry={96} fill={hair} />
              <path d="M162 252 L162 322 Q180 334 198 322 L198 252 Z" fill={skin} />
              <path d="M162 262 Q180 290 198 262 L198 282 Q180 302 162 282 Z" fill={skinShade} />
              <ellipse cx={122} cy={192} rx={8} ry={13} fill={skin} />
              <ellipse cx={238} cy={192} rx={8} ry={13} fill={skin} />
              <path d="M122 168 C 122 108, 238 108, 238 168 C 238 228, 214 270, 180 276 C 146 270, 122 228, 122 168 Z" fill={skin} />
              <ellipse cx={146} cy={222} rx={11} ry={5} fill="#F29C9C" opacity={mood === "happy" || mood === "wink" ? 0.65 : 0.35} />
              <ellipse cx={214} cy={222} rx={11} ry={5} fill="#F29C9C" opacity={mood === "happy" || mood === "wink" ? 0.65 : 0.35} />
              <path d="M120 150 C 108 200, 112 246, 134 266 C 128 230, 130 196, 136 160 Z" fill={hair} />
              <path d="M240 150 C 252 200, 248 246, 226 266 C 232 230, 230 196, 224 160 Z" fill={hair} />
              <path d="M114 172 C 104 104, 160 70, 206 80 C 250 90, 266 132, 248 178 C 240 156, 228 140, 214 134 C 210 150, 196 160, 178 158 C 186 146, 186 136, 184 130 C 168 150, 148 160, 128 160 C 124 166, 118 170, 114 172 Z" fill={hair} />
              <path d="M140 104 Q170 88 204 94" stroke="#3A4262" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
              <circle cx={224} cy={124} r={8} fill={c.accent} />
              <path d={brows[mood][0]} stroke={hair} strokeWidth={5} fill="none" strokeLinecap="round" />
              <path d={brows[mood][1]} stroke={hair} strokeWidth={5} fill="none" strokeLinecap="round" />
              <Eye x={155} open={blink * eyeScale} closed={mood === "happy"} />
              <Eye x={205} open={blink * eyeScale} closed={mood === "happy" || mood === "wink"} />
              <path d="M181 206 Q177 222 183 226" stroke="#C98F72" strokeWidth={2.5} fill="none" strokeLinecap="round" />
              {mouth > 0.08 ? (
                <ellipse cx={180} cy={245} rx={7 + mouth * 5} ry={1.5 + mouth * 8} fill="#6B2533" />
              ) : (
                idleMouth[mood]
              )}
            </g>

            <path d="M136 318 Q180 342 224 318 L234 352 Q180 378 126 352 Z" fill="url(#kn-steel-dark)" stroke="#6F7A97" strokeWidth={2} />
            <path d="M98 372 Q180 336 262 372 L278 530 L82 530 Z" fill="url(#kn-steel)" stroke="#6F7A97" strokeWidth={2} />
            <path d="M180 358 L180 530" stroke="#7F8AA8" strokeWidth={3} />
            <path d="M90 474 Q180 454 270 474" stroke="#7F8AA8" strokeWidth={3} fill="none" />
            <path d="M180 392 L204 402 L204 420 C204 436 194 448 180 454 C166 448 156 436 156 420 L156 402 Z" fill="#20264F" stroke={c.accent} strokeWidth={3} />
            <path d="M169 421 L177 429 L192 412" stroke={c.accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 424 C 34 372, 70 340, 122 344 C 142 346, 152 360, 148 378 C 120 374, 80 390, 58 428 Z" fill="url(#kn-steel)" stroke="#6F7A97" strokeWidth={2} />
            <path d="M56 400 C 76 376, 104 364, 136 364" stroke="#7F8AA8" strokeWidth={2.5} fill="none" />
            <path d="M320 424 C 326 372, 290 340, 238 344 C 218 346, 208 360, 212 378 C 240 374, 280 390, 302 428 Z" fill="url(#kn-steel)" stroke="#6F7A97" strokeWidth={2} />
            <path d="M304 400 C 284 376, 256 364, 224 364" stroke="#7F8AA8" strokeWidth={2.5} fill="none" />
            <circle cx={92} cy={360} r={3} fill="#6F7A97" />
            <circle cx={268} cy={360} r={3} fill="#6F7A97" />
          </g>

          <g
            transform={`translate(0 ${interpolate(frame, [1011, 1030, 1300, 1330, 4083, 4100, 4330, 4360], [190, -70, -70, 190, 190, -70, -70, 190], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })})`}
          >
            <path d="M232 380 L332 380 C 338 450, 318 500, 282 530 C 246 500, 226 450, 232 380 Z" fill="#2B3274" stroke="#C9D1E3" strokeWidth={6} />
            <path d="M282 416 L304 425 L304 442 C304 457 295 468 282 474 C269 468 260 457 260 442 L260 425 Z" fill="#20264F" stroke={c.accent} strokeWidth={3} />
            <path d="M272 442 L279 449 L293 434" stroke={c.accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export const Knight = Interactive.create({
  Component: KnightInner,
  layout: "none",
});
