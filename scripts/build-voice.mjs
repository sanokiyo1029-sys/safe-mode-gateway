// Builds the knight's voiceover from src/script.ts with VoiceStudio.
//
//   node scripts/build-voice.mjs            synthesize missing clips, mix, write envelope
//   node scripts/build-voice.mjs --force    re-synthesize every clip
//   node scripts/build-voice.mjs --fake     no audio: a stand-in mouth envelope from timing
//
// Each sentence is spoken into public/voice/clips/, placed on the frame where the
// visuals expect it (narration-timing.ts), mixed into public/voice/narration.wav,
// its loudness per video frame goes to src/voice-envelope.json for lip sync, and
// each line's start, end and estimated word times go to src/voice-timing.json.
// VOICE_SEED and VOICE_SPEED pick the take (defaults 2024 and 1.0).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, FPS, TOTAL_SECONDS } from "../src/script.ts";
import { timeSentences } from "../src/narration-timing.ts";

const VOICE = process.env.VOICE_NAME ?? "Knight narrator";
const SEED = process.env.VOICE_SEED ?? "2024";
const SPEED = process.env.VOICE_SPEED ?? "1.0";
const CLI = join(process.env.LOCALAPPDATA ?? "", "Programs/VoiceStudio/resources/cli/voicestudio.exe");
const RATE = 48000;
const root = fileURLToPath(new URL("..", import.meta.url));
const clipsDir = join(root, "public/voice/clips");
const totalFrames = TOTAL_SECONDS * FPS;
const args = new Set(process.argv.slice(2));

const lines = SCENES.flatMap((scene) =>
  timeSentences(scene.text, scene.seconds * FPS)
    .map((s, i) => ({ ...s, id: `${scene.id}-${String(i).padStart(2, "0")}`, at: scene.start * FPS + s.from }))
    .filter((s) => s.text !== "(pause)"),
);

const readWav = (file) => {
  const b = readFileSync(file);
  let p = 12, fmt, data;
  while (p < b.length - 8) {
    const id = b.toString("ascii", p, p + 4), size = b.readUInt32LE(p + 4);
    if (id === "fmt ") fmt = { format: b.readUInt16LE(p + 8), channels: b.readUInt16LE(p + 10), rate: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    if (id === "data") data = b.subarray(p + 8, p + 8 + size);
    p += 8 + size + (size % 2);
  }
  if (!fmt || !data) throw new Error(`${file}: not a WAV file`);
  const bytes = fmt.bits / 8, frames = Math.floor(data.length / bytes / fmt.channels);
  const read = (o) =>
    fmt.format === 3 ? data.readFloatLE(o)
    : fmt.bits === 16 ? data.readInt16LE(o) / 32768
    : fmt.bits === 24 ? data.readIntLE(o, 3) / 8388608
    : data.readInt32LE(o) / 2147483648;
  const mono = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let ch = 0; ch < fmt.channels; ch++) sum += read((i * fmt.channels + ch) * bytes);
    mono[i] = sum / fmt.channels;
  }
  // Note: linear resampling is fine for speech; use a proper resampler for music.
  if (fmt.rate === RATE) return mono;
  const out = new Float32Array(Math.round((frames * RATE) / fmt.rate));
  for (let i = 0; i < out.length; i++) {
    const x = (i * fmt.rate) / RATE, j = Math.floor(x), t = x - j;
    out[i] = (mono[j] ?? 0) * (1 - t) + (mono[j + 1] ?? 0) * t;
  }
  return out;
};

const writeWav = (file, samples) => {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  writeFileSync(file, b);
};

const envelopeOf = (samples) => {
  const per = RATE / FPS;
  const rms = Array.from({ length: totalFrames }, (_, f) => {
    let sum = 0;
    for (let i = Math.round(f * per); i < Math.round((f + 1) * per); i++) sum += (samples[i] ?? 0) ** 2;
    return Math.sqrt(sum / per);
  });
  const loud = [...rms].filter((v) => v > 0.005).sort((a, b) => a - b);
  const ref = loud[Math.floor(loud.length * 0.95)] || 1;
  return rms.map((v) => Math.round(Math.min(1, v / ref) * 100) / 100);
};

const writeEnvelope = (env) => {
  writeFileSync(join(root, "src/voice-envelope.json"), JSON.stringify(env));
  console.log(`wrote src/voice-envelope.json (${env.length} frames)`);
};

// Where speech starts and ends inside a clip, in seconds (10 ms windows over a loudness gate).
const voiced = (clip) => {
  const win = RATE / 100, rms = [];
  for (let i = 0; i + win <= clip.length; i += win) {
    let sum = 0;
    for (let j = 0; j < win; j++) sum += clip[i + j] ** 2;
    rms.push(Math.sqrt(sum / win));
  }
  const gate = rms.reduce((a, b) => Math.max(a, b), 0) * 0.08;
  return [rms.findIndex((v) => v > gate) / 100, (rms.findLastIndex((v) => v > gate) + 1) / 100];
};

// Note: word times are spread by letter count with a pause after punctuation, not aligned
// to the audio; good to ~0.3 s, enough for 1-3 word caption chips. Use forced alignment if
// captions ever need to be exact.
const spread = (text, from, to) => {
  const words = text.split(/\s+/);
  const size = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2);
  const pause = words.map((w) => (/[.?!]$/.test(w) ? 7 : /[,;:]$/.test(w) ? 4 : 0));
  const total = size.reduce((a, b, i) => a + b + pause[i], 0) - pause.at(-1);
  let t = 0;
  return words.map((w, i) => {
    const f = Math.round(from + (t / total) * (to - from));
    t += size[i] + pause[i];
    return { w, f };
  });
};

const writeTiming = (timed) => {
  writeFileSync(join(root, "src/voice-timing.json"), JSON.stringify(timed));
  console.log(`wrote src/voice-timing.json (${timed.length} lines)`);
};

if (args.has("--fake")) {
  const env = new Array(totalFrames).fill(0);
  for (const l of lines) {
    const end = l.at + l.durationInFrames - 8;
    for (let f = l.at + 4; f < end; f++) env[f] = Math.round((0.35 + 0.65 * Math.abs(Math.sin(f / 2.3))) * 100) / 100;
  }
  writeEnvelope(env);
  writeTiming(lines.map((l) => ({ id: l.id, text: l.text, start: l.at, end: l.at + l.durationInFrames - 8, words: spread(l.text, l.at + 4, l.at + l.durationInFrames - 8) })));
  process.exit(0);
}

if (!existsSync(CLI)) throw new Error(`VoiceStudio CLI not found at ${CLI}`);
mkdirSync(clipsDir, { recursive: true });
const mix = new Float32Array(totalFrames * (RATE / FPS));
const report = [];
const timed = [];
let prevEnd = 0;
for (const l of lines) {
  const file = join(clipsDir, `${l.id}.wav`);
  if (args.has("--force") || !existsSync(file)) {
    process.stdout.write(`speaking ${l.id} ... `);
    execFileSync(CLI, ["--url", "http://127.0.0.1:3900", "speak", "--voice", VOICE, "--seed", SEED, "--speed", SPEED, "--language", "en", "-o", file, "--overwrite", l.text], { stdio: ["ignore", "ignore", "inherit"] });
    console.log("ok");
  }
  const clip = readWav(file);
  const frames = Math.ceil((clip.length / RATE) * FPS);
  // A line that would talk over the previous one waits for it (plus a breath).
  const at = Math.max(l.at, prevEnd + 6);
  prevEnd = at + frames;
  const offset = Math.round((at / FPS) * RATE);
  clip.forEach((v, i) => { if (offset + i < mix.length) mix[offset + i] += v; });
  const [from, to] = voiced(clip);
  timed.push({ id: l.id, text: l.text, start: at, end: at + Math.round(to * FPS), words: spread(l.text, at + from * FPS, at + to * FPS) });
  report.push({ id: l.id, slot: l.durationInFrames, clip: frames, over: frames - l.durationInFrames });
}
writeWav(join(root, "public/voice/narration.wav"), mix);
console.log("wrote public/voice/narration.wav");
writeEnvelope(envelopeOf(mix));
writeTiming(timed);
const over = report.filter((r) => r.over > 0);
console.log(over.length ? "clips longer than their slot (the next line waits, frames):" : "every clip fits its slot");
for (const r of over) console.log(`  ${r.id}  slot ${r.slot}  clip ${r.clip}  over +${r.over}`);
