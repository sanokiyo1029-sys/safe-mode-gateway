import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { c, display, sans, sticker } from "./theme";
import timing from "./voice-timing.json";

// The explainer-reel frame around the scenes: white and purple backdrop, a title card
// with chapter dots that flips down on every change, a footer bar, and caption chips
// that flip up word by word.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flip = Easing.out(Easing.back(1.7));

// Horizontal centre of the scene area (scenes are drawn at 80% from x = 360).
export const CONTENT_X = 1128;

export const Backdrop = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 85% 80% at 58% 42%, #FFFFFF 0%, #F8F6FC 55%, ${c.bgDeep} 100%)`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(#6D678112 1.5px, transparent 1.5px), linear-gradient(90deg, #6D678112 1.5px, transparent 1.5px)",
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
        <span key={i} style={{ color: c.lilac }}>
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
        perspective: 900,
        opacity: interpolate(frame, [8, 22], [0, 1], clamp),
      }}
    >
      <div
        style={{
          padding: "12px 38px 14px",
          borderRadius: 22,
          backgroundColor: c.ink,
          boxShadow: sticker,
          textAlign: "center",
          transformOrigin: "50% 0%",
          rotate: `x ${interpolate(local, [0, 16], [-100, 0], { ...clamp, easing: flip })}deg`,
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 800, letterSpacing: 4, color: c.hair }}>
          {card.kicker}
        </div>
        <div style={{ fontFamily: display, fontSize: 54, fontWeight: 900, lineHeight: 1.08, color: "#FFFFFF", whiteSpace: "nowrap" }}>
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
                border: `2px solid ${i <= card.chapter ? c.lilac : "#6D6781"}`,
                backgroundColor: i === card.chapter ? c.lilac : i < card.chapter ? "#CFC6F580" : "transparent",
              }}
            />
          ))}
        </div>
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
      borderTop: "2px solid #FFFFFF33",
      background: `linear-gradient(180deg, #4A3F78 0%, ${c.ink} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: display,
      fontSize: 38,
      fontWeight: 900,
      color: "#FFFFFF",
    }}
  >
    Safe-Mode Gateway
    <div style={{ position: "absolute", right: 40, fontFamily: sans, fontSize: 19, fontWeight: 600, color: c.hair }}>
      Runs on <span style={{ color: "#FF9900" }}>AWS</span> · Voice by <span style={{ color: "#FFFFFF" }}>ElevenLabs</span>
    </div>
  </div>
);

// Words in chips of up to three, a new chip group after punctuation. The word being said
// is filled purple; key words of the demo get a purple chip.
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

const KEY =
  /^(safe-mode|gateway|delete|deletion|deleting|destructive|deny|denied|approve|approved|approval|undo|policy|log|mcp|search|rename|renaming|three)$/i;
const isKey = (w: string) => KEY.test(w.replace(/[^\p{L}\p{N}-]/gu, ""));

// Captions sit beside the presenter's head, as in the reference reel: the empty column
// above her (scenes start at x = 456). Text only, in her hair colour with a purple-ink
// outline; the word being said is white and a little bigger, key words are deeper purple.
const CAPTION_COLUMN = { left: 16, width: 440, bottom: 600 };
const fontFor = (w: string) => Math.min(58, Math.floor(CAPTION_COLUMN.width / (w.length * 0.62)));

export const Captions = () => {
  const frame = useCurrentFrame();
  const group = groups.find((g) => frame >= g.words[0].f && frame < g.end);
  if (!group) {
    return null;
  }
  const active = [...group.words].reverse().find((w) => frame >= w.f);
  return (
    <div
      style={{
        position: "absolute",
        ...CAPTION_COLUMN,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-end",
        columnGap: 18,
        rowGap: 2,
        perspective: 700,
      }}
    >
      {group.words.map((word) => {
        const t = frame - word.f;
        const on = word === active;
        return (
          <div
            key={word.f}
            style={{
              fontFamily: display,
              fontSize: fontFor(word.w),
              fontWeight: 900,
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              color: on ? "#FFFFFF" : isKey(word.w) ? "#8F80DA" : c.hair,
              WebkitTextStroke: `7px ${c.ink}`,
              paintOrder: "stroke fill",
              textShadow: `0 5px 0 ${c.ink}, 0 10px 18px #6D678155`,
              transformOrigin: "50% 100%",
              opacity: interpolate(t, [0, 3], [0, 1], clamp),
              rotate: `x ${interpolate(t, [0, 10], [-90, 0], { ...clamp, easing: flip })}deg`,
              scale: t < 10 ? interpolate(t, [0, 10], [0.6, 1], { ...clamp, easing: flip }) : on ? 1.1 : 1,
            }}
          >
            {word.w}
          </div>
        );
      })}
    </div>
  );
};
