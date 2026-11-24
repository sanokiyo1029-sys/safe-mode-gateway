import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { c, display, sans, sticker } from "./theme";
import timing from "./voice-timing.json";

// The explainer-reel frame around the scenes: blue backdrop, a title card with
// chapter dots on top, a footer bar, and word-by-word caption chips.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = Easing.out(Easing.back(2.2));

// Horizontal centre of the scene area (scenes are drawn at 80% from x = 360).
export const CONTENT_X = 1128;

export const Backdrop = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 75% at 58% 42%, #3A69F2 0%, ${c.bg} 50%, ${c.bgDeep} 100%)`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(#FFFFFF0B 1.5px, transparent 1.5px), linear-gradient(90deg, #FFFFFF0B 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
      }}
    />
  </AbsoluteFill>
);

// Global frames, matched to the narration lines. *word* is drawn in the accent colour.
const CARDS = [
  { at: 0, chapter: 0, kicker: "TODAY’S TASK", title: "one *simple* task" },
  { at: 390, chapter: 0, kicker: "BUT WHAT IF", title: "it can *delete*" },
  { at: 1011, chapter: 0, kicker: "THE FIX", title: "check *before* it runs" },
  { at: 1350, chapter: 1, kicker: "HOW IT WORKS", title: "every call *checked*" },
  { at: 1840, chapter: 1, kicker: "READ · WRITE · DESTRUCTIVE", title: "three *classes*" },
  { at: 2208, chapter: 1, kicker: "THE OPERATOR", title: "sets the *policy*" },
  { at: 2850, chapter: 2, kicker: "LIVE DEMO", title: "allow the *search*" },
  { at: 3195, chapter: 2, kicker: "LIVE DEMO", title: "pause the *delete*" },
  { at: 4287, chapter: 2, kicker: "ACTIVITY LOG", title: "both *events*" },
  { at: 4650, chapter: 3, kicker: "LIVE DEMO", title: "approve a *change*" },
  { at: 5548, chapter: 3, kicker: "TOO QUICK?", title: "just *undo* it" },
  { at: 5960, chapter: 3, kicker: "GOOD TO KNOW", title: "not everything *undoes*" },
  { at: 6600, chapter: 4, kicker: "THE PAPER TRAIL", title: "every *decision* logged" },
  { at: 7568, chapter: 4, kicker: "WHEN SOMETHING BREAKS", title: "*diagnose* it" },
  { at: 8100, chapter: 5, kicker: "BEYOND FILES", title: "any *MCP* tool" },
  { at: 8507, chapter: 5, kicker: "ASK YOURSELF", title: "three *questions*" },
];

const Accented = ({ text }: { readonly text: string }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith("*") ? (
        <span key={i} style={{ color: c.accent }}>
          {part.slice(1, -1)}
        </span>
      ) : (
        part
      ),
    )}
  </>
);

export const TitleCard = () => {
  const frame = useCurrentFrame();
  const card = [...CARDS].reverse().find((k) => k.at <= frame) ?? CARDS[0];
  const local = frame - card.at;
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        top: 34,
        translate: "-50% 0",
        padding: "12px 38px 14px",
        borderRadius: 22,
        backgroundColor: "#161B45",
        boxShadow: sticker,
        textAlign: "center",
        opacity: interpolate(frame, [8, 22], [0, 1], clamp),
        scale: interpolate(local, [0, 12], [0.86, 1], { ...clamp, easing: pop }),
      }}
    >
      <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 800, letterSpacing: 4, color: "#AFC0FF" }}>
        {card.kicker}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 54,
          fontWeight: 900,
          lineHeight: 1.08,
          color: c.text,
          whiteSpace: "nowrap",
          opacity: interpolate(local, [0, 6], [0, 1], clamp),
        }}
      >
        <Accented text={card.title} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              boxSizing: "border-box",
              border: `2px solid ${i <= card.chapter ? c.accent : "#5C6AB0"}`,
              backgroundColor: i === card.chapter ? c.accent : i < card.chapter ? "#8FB0FF66" : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const Footer = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 88,
      borderRadius: "28px 28px 0 0",
      borderTop: "2px solid #FFFFFF26",
      background: "linear-gradient(180deg, #27318A 0%, #1A2160 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: display,
      fontSize: 38,
      fontWeight: 900,
      color: c.text,
    }}
  >
    Safe-Mode Gateway
    <div style={{ position: "absolute", right: 40, fontFamily: sans, fontSize: 19, fontWeight: 600, color: c.muted }}>
      Runs on <span style={{ color: "#FF9900" }}>AWS</span> · Voice by <span style={{ color: c.paper }}>ElevenLabs</span>
    </div>
  </div>
);

// Words in chips of up to three, a new chip group after punctuation.
type Word = { readonly w: string; readonly f: number };
const groups = timing.flatMap((line) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  line.words.forEach((word, i) => {
    cur.push(word);
    if (cur.length === 3 || /[.,?!;:]$/.test(word.w) || i === line.words.length - 1) {
      out.push(cur);
      cur = [];
    }
  });
  return out.map((words, i) => ({ words, end: i + 1 < out.length ? out[i + 1][0].f : line.end + 12 }));
});

export const Captions = () => {
  const frame = useCurrentFrame();
  const group = groups.find((g) => frame >= g.words[0].f && frame < g.end);
  if (!group) {
    return null;
  }
  return (
    <div style={{ position: "absolute", left: CONTENT_X, top: 916, translate: "-50% 0", display: "flex", gap: 12 }}>
      {group.words.map((word) => {
        const t = frame - word.f;
        return (
          <div
            key={word.f}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "3px 18px 7px 12px",
              borderRadius: 14,
              border: `3px solid ${c.ink}`,
              backgroundColor: c.paper,
              boxShadow: "0 0 0 4px #FFFFFF66, 0 10px 20px #0A1A6E55",
              fontFamily: display,
              fontSize: 38,
              fontWeight: 800,
              color: c.ink,
              whiteSpace: "nowrap",
              opacity: interpolate(t, [0, 3], [0, 1], clamp),
              scale: interpolate(t, [0, 7], [0.5, 1], { ...clamp, easing: pop }),
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, backgroundColor: c.bg, border: `2px solid ${c.ink}` }} />
            {word.w}
          </div>
        );
      })}
    </div>
  );
};
