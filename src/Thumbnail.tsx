import { AbsoluteFill, Img, staticFile } from "remotion";
import { Backdrop } from "./Chrome";
import { c, display, sans, sticker } from "./theme";

// 1280 x 720 video thumbnail in the video's white and purple style:
// title and tagline on the left, the presenter's head and collar on the right.
const SCALE = 1.1;
const COLLAR_Y = 570; // presenter.png is cut off just below the turtleneck collar

export const Thumbnail = () => (
  <AbsoluteFill>
    <Backdrop />
    <div
      style={{
        position: "absolute",
        right: -120,
        bottom: 0,
        width: 796 * SCALE,
        height: COLLAR_Y * SCALE,
        overflow: "hidden",
      }}
    >
      <Img src={staticFile("presenter.png")} style={{ width: 796 * SCALE, display: "block" }} />
    </div>

    <div style={{ position: "absolute", left: 72, top: 150, display: "flex", flexDirection: "column", gap: 22 }}>
      <div
        style={{
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 20px",
          borderRadius: 999,
          backgroundColor: c.ink,
          boxShadow: sticker,
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: 3,
          color: c.hair,
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={c.lilac} strokeWidth={2}>
          <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        WHACKIEST 2026 · TRACK 1
      </div>
      <div style={{ fontFamily: display, fontSize: 118, fontWeight: 900, lineHeight: 0.98, color: c.ink, letterSpacing: -1 }}>
        Safe-Mode
        <br />
        <span style={{ color: c.accent }}>Gateway</span>
      </div>
      <div style={{ fontFamily: sans, fontSize: 36, fontWeight: 600, color: c.muted, maxWidth: 560, lineHeight: 1.25 }}>
        Your AI agent asks. <span style={{ color: c.ink }}>You decide.</span>
      </div>
    </div>
  </AbsoluteFill>
);
