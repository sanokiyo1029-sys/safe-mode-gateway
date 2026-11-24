# Safe-Mode Gateway: demo video

A 5-minute animated demo of **Safe-Mode Gateway**, an MCP approval gateway (Track 1). It sits between an AI agent and its tools, lets read calls through, pauses risky ones for a human decision, can undo approved changes, and logs everything.

The video is built with [Remotion](https://www.remotion.dev): 1920×1080, 30 fps, 9000 frames. An animated knight narrates it in an explainer-reel style, with a title card, word-by-word captions, and sticker-style cards. The planned AWS + ElevenLabs architecture is in [ARCHITECTURE.md](ARCHITECTURE.md).

The rendered MP4 is attached to the repo's releases.

## Run it

```console
npm i
npm run dev                                   # Remotion Studio
npx remotion render SafeModeGatewayDemo out/safe-mode-gateway-demo.mp4
```

## Change the narration

1. Edit the script in `src/script.ts`. It is the single source for the voice and the captions.
2. Rebuild the voiceover:

   ```console
   node scripts/build-voice.mjs --force
   ```

   This needs [VoiceStudio](https://github.com/debpalash/voicestudio) running locally with a voice named "Knight narrator". `VOICE_SEED` (default 2024) and `VOICE_SPEED` (default 1.0) pick the take. Use `--fake` to make stand-in timing without any audio.

The scene animations are timed to each sentence's cue frame. If you change the text, check the scenes in Studio.

## Checks

```console
node scripts/check-narration.mjs
npx tsc --noEmit
npx eslint src
```

## Credits

The voiceover was generated locally with VoiceStudio using the OmniVoice model (k2-fsa/OmniVoice), whose weights are licensed CC-BY-NC, non-commercial. The knight is an original SVG drawing.
