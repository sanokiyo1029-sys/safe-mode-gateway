// node scripts/check-narration.mjs
import assert from "node:assert/strict";
import { splitSentences, timeSentences } from "../src/narration-timing.ts";

const text = "First one. Is this second? Yes! I’ll hit Deny. (pause) The folder is still here.";
assert.deepEqual(splitSentences(text), [
  "First one.",
  "Is this second?",
  "Yes!",
  "I’ll hit Deny.",
  "(pause)",
  "The folder is still here.",
]);
assert.deepEqual(splitSentences("rename project-brief.md to final-brief.md."), [
  "rename project-brief.md to final-brief.md.",
]);

const timed = timeSentences(text, 900);
for (let i = 1; i < timed.length; i++) {
  assert.equal(timed[i].from, timed[i - 1].from + timed[i - 1].durationInFrames, "sentences are back to back");
}
const last = timed[timed.length - 1];
assert.ok(last.from + last.durationInFrames <= 900 - 30, "tail stays silent");
assert.ok(timed[0].from === 15, "lead-in");
console.log("narration timing ok");
