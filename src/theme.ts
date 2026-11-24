import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const sans = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

export const mono = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
}).fontFamily;

// Heavy soft serif for titles, captions and the footer (the explainer-reel look).
export const display = loadFraunces("normal", {
  weights: ["800", "900"],
  subsets: ["latin"],
}).fontFamily;

export const c = {
  bg: "#2350E0",
  bgDeep: "#1A3CC0",
  panel: "#1B2152",
  panel2: "#151A42",
  line: "#2E3778",
  ink: "#141A3C",
  paper: "#FFFFFF",
  text: "#F4F6FF",
  muted: "#A9B4E0",
  accent: "#8FB0FF",
  read: "#34D399",
  write: "#FBBF24",
  danger: "#F87171",
};

// White sticker ring plus a soft drop shadow, as on every card in the reference reel.
export const sticker = "0 0 0 3px #141A3C, 0 0 0 9px #FFFFFF, 0 22px 44px #0A1A6E66";
