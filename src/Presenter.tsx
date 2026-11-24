import type React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import envelope from "./voice-envelope.json";
import timing from "./voice-timing.json";
import { c, display } from "./theme";

// The narrator: an original 2D character drawn here in SVG (purple ombre side ponytail,
// bangs over one eye, cream cardigan over a black turtleneck), head and shoulders only.
// Each narration line picks an expression, like the pose swaps in the reference reel; her
// mouth follows the voiceover's loudness, she blinks, turns (a 3D mirror flip) at every new
// scene, and squashes, hops and pops a small icon at each line. The sticker outline is the
// same shapes drawn underneath with thick strokes, so no SVG filters slow the render.

const VB_W = 400;
const VB_H = 470;
const WIDTH = 430;
const HEIGHT = (WIDTH * VB_H) / VB_W;
const SCENE_STARTS = [0, 1350, 2850, 4650, 6600, 8100];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Mood = "neutral" | "happy" | "wink" | "shocked" | "stare" | "curious";

const moodOf = (text: string, i: number): Mood => {
  if (/\?$/.test(text)) return "curious";
  if (/delete an entire|already be gone|delete the client-files|riskier|disappeared|impossible to take back/i.test(text)) return "shocked";
  if (/too quickly|still a draft|denied before/i.test(text)) return "stare";
  if (/still here|approve this|automatically|restored|completed|all three|allows it/i.test(text)) return "happy";
  return (["neutral", "happy", "neutral", "wink"] as const)[i % 4];
};

const iconOf = (mood: Mood, i: number) =>
  mood === "curious" ? "?" : mood === "shocked" ? "!" : mood === "stare" ? "…" : mood === "happy" ? "✦" : i % 5 === 0 ? "♪" : "";

const moods = timing.map((line, i) => moodOf(line.text, i));
const icons = moods.map((mood, i) => iconOf(mood, i));

const loudness = (frame: number, radius: number) => {
  let sum = 0;
  for (let f = frame - radius; f <= frame + radius; f++) sum += envelope[f] ?? 0;
  return sum / (radius * 2 + 1);
};

const lineAt = (frame: number) => {
  for (let i = timing.length - 1; i >= 0; i--) if (timing[i].start <= frame) return i;
  return -1;
};

// Shapes shared by the art and its sticker outline (viewBox 400 x 470).
const BACK_HAIR = "M96 172 C 90 98, 142 50, 200 48 C 258 50, 310 98, 304 172 C 310 250, 316 330, 332 410 L 68 410 C 84 330, 90 250, 96 172 Z";
const PONYTAIL = "M268 96 C 300 70, 352 96, 360 160 C 368 230, 352 300, 366 360 C 340 352, 322 320, 318 280 C 314 230, 312 170, 284 128 Z";
const BODY = "M40 470 C 44 410, 70 372, 128 352 C 150 344, 168 336, 178 326 L 222 326 C 232 336, 250 344, 272 352 C 330 372, 356 410, 360 470 Z";
const FACE = "M124 160 C 122 232, 156 288, 200 304 C 244 288, 278 232, 276 160 C 276 112, 244 84, 200 84 C 156 84, 124 112, 124 160 Z";
const LOCK_L = "M128 120 C 112 170, 112 250, 126 312 C 134 296, 140 272, 142 240 C 144 200, 146 160, 150 128 Z";
const LOCK_R = "M272 120 C 288 170, 288 250, 274 312 C 266 296, 260 272, 258 240 C 256 200, 254 160, 250 128 Z";
const BANGS =
  "M118 150 C 116 96, 156 62, 204 62 C 252 64, 286 98, 284 152 C 274 140, 266 132, 258 128 C 262 150, 262 176, 254 198 C 248 176, 240 160, 230 150 C 230 170, 224 188, 214 200 C 212 182, 206 166, 196 156 C 186 186, 170 214, 148 238 C 152 214, 156 192, 156 172 C 150 182, 142 196, 130 206 C 132 184, 130 166, 118 150 Z";
const SILHOUETTE = [BACK_HAIR, PONYTAIL, BODY, FACE, LOCK_L, LOCK_R, BANGS];

const INK = c.ink;
const SKIN = "#FCE9DF";
const SKIN_SHADE = "#F3CFC4";
const MOUTH_RED = "#8C3A4E";
const EYE_Y = 212;

const spiral = (x: number, y: number) => {
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 5;
    const r = 1 + i * 0.2;
    d += `${i ? "L" : "M"}${(x + Math.cos(t) * r).toFixed(1)} ${(y + Math.sin(t) * r).toFixed(1)}`;
  }
  return d;
};

const Eye = ({ x, mood, blink, look }: { readonly x: number; readonly mood: Mood; readonly blink: number; readonly look: readonly [number, number] }) => {
  const y = EYE_Y;
  const left = x < 200;
  if (mood === "happy" || (mood === "wink" && !left)) {
    return <path d={`M${x - 20} ${y + 4} Q${x} ${y - 13} ${x + 20} ${y + 4}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  }
  const open = Math.max(0.08, blink * (mood === "stare" ? 0.55 : mood === "shocked" ? 1.12 : 1));
  const [dx, dy] = look;
  return (
    <g style={{ transformBox: "fill-box", transformOrigin: "50% 85%", scale: `1 ${open}` }}>
      <path d={`M${x - 23} ${y + 2} C${x - 20} ${y - 14} ${x + 20} ${y - 16} ${x + 24} ${y - 2} C${x + 18} ${y + 14} ${x - 16} ${y + 16} ${x - 23} ${y + 2} Z`} fill="#FFFFFF" />
      {mood === "shocked" ? (
        <path d={spiral(x, y + 1)} stroke="#4B4C96" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx={x + dx} cy={y + 1 + dy} rx={12} ry={14} fill="url(#pr-iris)" />
          <ellipse cx={x + dx} cy={y + 3 + dy} rx={5.5} ry={7.5} fill="#24224A" />
          <circle cx={x + dx + 4} cy={y - 5 + dy} r={4} fill="#FFFFFF" />
          <circle cx={x + dx - 5} cy={y + 8 + dy} r={1.8} fill="#FFFFFF" opacity={0.9} />
        </>
      )}
      <path d={`M${x - 26} ${y - 1} C${x - 20} ${y - 17} ${x + 20} ${y - 19} ${x + 27} ${y - 4}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d={left ? `M${x - 25} ${y - 2} l-7 -5` : `M${x + 26} ${y - 5} l7 -5`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${x - 16} ${y + 13} Q${x} ${y + 17} ${x + 16} ${y + 12}`} stroke={INK} strokeWidth={1.6} fill="none" opacity={0.7} />
    </g>
  );
};

const BROWS: Record<Mood, readonly [string, string]> = {
  neutral: ["M138 182 Q160 172 182 178", "M218 178 Q240 172 262 182"],
  happy: ["M138 178 Q160 168 182 174", "M218 174 Q240 168 262 178"],
  wink: ["M138 182 Q160 172 182 178", "M218 172 Q240 164 262 174"],
  shocked: ["M138 182 Q160 172 182 164", "M218 164 Q240 172 262 182"],
  stare: ["M140 186 Q160 182 182 184", "M218 184 Q240 182 260 186"],
  curious: ["M138 182 Q160 174 182 180", "M218 172 Q242 160 262 170"],
};

const LOOK: Record<Mood, readonly [number, number]> = {
  neutral: [0, 0],
  happy: [0, 0],
  wink: [0, 0],
  shocked: [0, 0],
  stare: [-5, 1],
  curious: [4, -2],
};

const IDLE_MOUTH: Record<Mood, React.ReactNode> = {
  neutral: <path d="M190 268 Q200 275 210 268" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />,
  happy: <path d="M185 265 Q200 287 215 265 Z" fill={MOUTH_RED} stroke={INK} strokeWidth={2} strokeLinejoin="round" />,
  wink: <path d="M188 266 Q201 278 213 264" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />,
  shocked: <ellipse cx={200} cy={271} rx={7} ry={9} fill={MOUTH_RED} stroke={INK} strokeWidth={2} />,
  stare: <path d="M190 271 Q195 267 200 271 Q205 275 210 271" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />,
  curious: <path d="M192 269 Q202 274 210 266" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />,
};

const Character = ({ mood, mouth, blink }: { readonly mood: Mood; readonly mouth: number; readonly blink: number }) => {
  const flushed = mood === "stare" || mood === "shocked" || mood === "happy";
  const openW = 6 + mouth * 6;
  const openH = 2 + mouth * 9;
  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="pr-hair" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="420">
          <stop offset="0" stopColor="#E4DBF7" />
          <stop offset="0.35" stopColor="#C4AEEE" />
          <stop offset="0.75" stopColor="#9B7BE3" />
          <stop offset="1" stopColor="#7356CF" />
        </linearGradient>
        <linearGradient id="pr-iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4B4C96" />
          <stop offset="1" stopColor="#9AA6EE" />
        </linearGradient>
      </defs>

      {/* Sticker outline: soft flat shadow, purple-ink edge, white ring. */}
      <g transform="translate(6 10)" opacity={0.22}>
        {SILHOUETTE.map((d) => <path key={d} d={d} fill="#6D6781" stroke="#6D6781" strokeWidth={26} strokeLinejoin="round" />)}
      </g>
      {SILHOUETTE.map((d) => <path key={d} d={d} fill={INK} stroke={INK} strokeWidth={26} strokeLinejoin="round" />)}
      {SILHOUETTE.map((d) => <path key={d} d={d} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={18} strokeLinejoin="round" />)}

      <path d={BACK_HAIR} fill="url(#pr-hair)" stroke={INK} strokeWidth={2.5} />
      <path d="M100 220 Q92 320 84 400 M300 220 Q308 320 316 400" stroke="#8E73D6" strokeWidth={2} fill="none" opacity={0.6} />
      <path d={PONYTAIL} fill="url(#pr-hair)" stroke={INK} strokeWidth={2.5} />
      <path d="M290 112 Q342 160 338 300 M304 120 Q350 190 352 330" stroke="#8E73D6" strokeWidth={2} fill="none" opacity={0.6} />

      <path d={BODY} fill="#EADFCB" stroke={INK} strokeWidth={2.5} />
      <path d="M174 334 C 160 360, 152 410, 150 470 M226 334 C 240 360, 248 410, 250 470" stroke="#C9B89A" strokeWidth={3} fill="none" />
      <path d="M176 300 L 224 300 L 226 334 C 246 344, 252 400, 250 470 L 150 470 C 148 400, 154 344, 174 334 Z" fill="#2F2A3A" stroke={INK} strokeWidth={2.5} />
      <path d="M176 318 Q200 326 224 318" stroke="#4A4458" strokeWidth={2} fill="none" />

      <path d="M184 262 L216 262 L218 306 L182 306 Z" fill={SKIN} />
      <path d="M184 270 Q200 294 216 270 L216 290 Q200 304 184 290 Z" fill={SKIN_SHADE} />
      <path d={FACE} fill={SKIN} stroke={INK} strokeWidth={2} />

      <ellipse cx={150} cy={242} rx={16} ry={7} fill="#F4A7B4" opacity={flushed ? 0.7 : 0.3} />
      <ellipse cx={250} cy={242} rx={16} ry={7} fill="#F4A7B4" opacity={flushed ? 0.7 : 0.3} />
      {mood === "stare" || mood === "shocked" ? (
        <path d="M140 246 l6 -9 M148 247 l6 -9 M156 247 l6 -9 M240 246 l6 -9 M248 247 l6 -9 M256 247 l6 -9" stroke="#E07A8E" strokeWidth={2} strokeLinecap="round" />
      ) : null}
      <path d="M203 240 L200 247" stroke="#D9A99A" strokeWidth={2} strokeLinecap="round" />
      {mouth > 0.08 ? (
        <>
          <ellipse cx={200} cy={270} rx={openW} ry={openH} fill={MOUTH_RED} stroke={INK} strokeWidth={2} />
          {mouth > 0.35 ? <ellipse cx={200} cy={270 + openH * 0.5} rx={openW * 0.6} ry={openH * 0.35} fill="#E98C98" /> : null}
        </>
      ) : (
        IDLE_MOUTH[mood]
      )}
      <Eye x={162} mood={mood} blink={blink} look={LOOK[mood]} />
      <Eye x={238} mood={mood} blink={blink} look={LOOK[mood]} />

      <path d={LOCK_L} fill="url(#pr-hair)" stroke={INK} strokeWidth={2.5} />
      <path d={LOCK_R} fill="url(#pr-hair)" stroke={INK} strokeWidth={2.5} />
      <path d="M136 140 Q128 220 130 300 M264 140 Q272 220 270 300" stroke="#8E73D6" strokeWidth={2} fill="none" opacity={0.6} />
      <path d={BANGS} fill="url(#pr-hair)" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M200 70 Q178 120 158 200 M206 72 Q214 120 214 196 M212 70 Q240 110 254 194" stroke="#9B82DD" strokeWidth={2} fill="none" opacity={0.7} />
      <path d="M150 102 Q178 86 212 88" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d="M232 94 Q254 104 264 122" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55} />

      <path d={BROWS[mood][0]} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={BROWS[mood][1]} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={0.85} />

      <path d="M270 92 l-14 -12 l2 20 Z M282 100 l14 -14 l2 20 Z" fill={c.accent} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={276} cy={98} r={6} fill={c.accent} stroke={INK} strokeWidth={2} />

      {mood === "shocked" ? (
        <path d="M268 156 C 262 168, 262 176, 268 178 C 274 176, 274 168, 268 156 Z" fill="#CFEAFF" stroke={INK} strokeWidth={1.8} />
      ) : null}
    </svg>
  );
};

const PresenterInner = ({ style }: { readonly style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const mouth = Math.min(1, loudness(frame, 1) * 1.15);
  const talk = loudness(frame, 6);
  const blink = frame % 107 < 5 ? 0.1 : 1;

  const scene = SCENE_STARTS.filter((s) => s <= frame).length - 1;
  const turnT = interpolate(frame - SCENE_STARTS[scene], [0, 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const turn = scene === 0 ? 0 : (scene - 1) * 180 + 180 * turnT;

  const line = lineAt(frame);
  const mood: Mood = line >= 0 ? moods[line] : "neutral";
  const since = line >= 0 ? frame - timing[line].start : 99;
  const squash = since < 12 ? Math.sin((since / 12) * Math.PI) : 0;
  const hop = -squash * 14;
  const breathe = Math.sin(frame / 22) * 3;
  const sway = Math.sin(frame / 47) * 0.8 + talk * Math.sin(frame / 9) * 1.2 + (mood === "curious" ? 3 : 0);
  const slideIn = interpolate(frame, [0, 35], [-520, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const icon = line >= 0 ? icons[line] : "";

  return (
    <div style={{ ...style, perspective: 1100 }}>
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          translate: `${slideIn}px ${hop + breathe}px`,
          rotate: `${sway}deg`,
          transformOrigin: "50% 100%",
          scale: `${1 - 0.05 * squash} ${1 + 0.06 * squash}`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, rotate: `y ${turn}deg` }}>
          <Character mood={mood} mouth={mouth} blink={blink} />
        </div>
        {icon && since < 45 ? (
          <div
            style={{
              position: "absolute",
              left: WIDTH * 0.5,
              top: -8,
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
