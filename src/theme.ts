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

// White and purple, taken from the presenter's hair (#BCB7CE, shadows #6D6781).
export const c = {
  bg: "#FFFFFF",
  bgDeep: "#ECE8F6",
  panel: "#FFFFFF",
  panel2: "#F6F4FB",
  line: "#E3DFEE",
  ink: "#2B2540", // outlines, body text, the dark title card and footer
  paper: "#FFFFFF",
  text: "#2B2540",
  muted: "#7A7392",
  accent: "#7B6CC9", // purple for highlights on white
  hair: "#BCB7CE",
  lilac: "#CFC6F5", // accent on the dark purple card and footer
  wash: "#EFEBFA", // soft purple fill for chips and bubbles
  read: "#15994A",
  write: "#C27A06",
  danger: "#D8343A",
};

// Purple-ink outline, white ring and a soft purple shadow: the reel's sticker cards, on white.
export const sticker = "0 0 0 3px #2B2540, 0 0 0 9px #FFFFFF, 0 0 0 10px #E3DFEE, 0 20px 40px #6D678140";
