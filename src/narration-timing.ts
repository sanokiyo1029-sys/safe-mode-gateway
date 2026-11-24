// Splits a narration block into sentences and spreads them across a scene by
// word count. "(pause)" is a silent beat that takes time but shows nothing.
// Note: word-count timing is an estimate; once a real voiceover exists,
// replace it with transcribed captions (@remotion/captions).

export type TimedSentence = {
  readonly text: string;
  readonly from: number;
  readonly durationInFrames: number;
};

const LEAD_IN = 15;
const TAIL = 30;
const PAUSE_WEIGHT = 6;

export const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.?!)])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const weight = (s: string) =>
  s === "(pause)" ? PAUSE_WEIGHT : s.split(/\s+/).length + 1.5;

export const timeSentences = (
  text: string,
  durationInFrames: number,
): TimedSentence[] => {
  const sentences = splitSentences(text);
  const total = sentences.reduce((sum, s) => sum + weight(s), 0);
  const available = durationInFrames - LEAD_IN - TAIL;
  let cursor = LEAD_IN;
  return sentences.map((s) => {
    const length = Math.floor((weight(s) / total) * available);
    const timed = { text: s, from: Math.round(cursor), durationInFrames: length };
    cursor += length;
    return timed;
  });
};
