import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop, Captions, Footer, TitleCard } from "./Chrome";
import { Presenter } from "./Presenter";
import { AllowBlock } from "./scenes/AllowBlock";
import { ApproveUndo } from "./scenes/ApproveUndo";
import { AuditTrail } from "./scenes/AuditTrail";
import { Close } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { HowItWorks } from "./scenes/HowItWorks";

export type DemoVideoProps = {
  readonly showNarration: boolean;
};

// Scene boundaries match the script's timestamps exactly (0:00, 0:45, 1:35, 2:35, 3:40, 4:30, 5:00).
const BOUNDS = [0, 1350, 2850, 4650, 6600, 8100, 9000];

// Page-turn flip between scenes: the old scene swings away, the new one swings in.
const sceneFlip = (frame: number) => {
  const i = BOUNDS.filter((b) => b <= frame).length - 1;
  const local = frame - BOUNDS[i];
  const dur = BOUNDS[i + 1] - BOUNDS[i];
  if (i > 0 && local < 18)
    return interpolate(local, [0, 18], [75, 0], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.4)),
    });
  if (i < BOUNDS.length - 2 && local > dur - 15)
    return interpolate(local, [dur - 15, dur], [0, -75], {
      extrapolateLeft: "clamp",
      easing: Easing.in(Easing.cubic),
    });
  return 0;
};

// Explainer-reel layout: title card on top, scenes drawn at 80% to the right of the presenter,
// word chips above the footer bar.
export const DemoVideo = ({ showNarration }: DemoVideoProps) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          transformOrigin: "0px 0px",
          scale: 0.8,
          translate: "360px 130px",
          perspective: 2400,
        }}
      >
        <AbsoluteFill style={{ rotate: `y ${sceneFlip(frame)}deg` }}>
          <Track name="Scenes">
            <Hook name="0:00 The hook" from={0} durationInFrames={45 * fps} />
            <HowItWorks
              name="0:45 How the gateway works"
              from={45 * fps}
              durationInFrames={50 * fps}
            />
            <AllowBlock
              name="1:35 Allow the search, block the delete"
              from={95 * fps}
              durationInFrames={60 * fps}
            />
            <ApproveUndo
              name="2:35 Approve a change, then undo it"
              from={155 * fps}
              durationInFrames={65 * fps}
            />
            <AuditTrail
              name="3:40 The audit trail"
              from={220 * fps}
              durationInFrames={50 * fps}
            />
            <Close
              name="4:30 Close"
              from={270 * fps}
              durationInFrames={30 * fps}
            />
          </Track>
        </AbsoluteFill>
      </AbsoluteFill>
      <TitleCard />
      <Presenter
        name="Narrator"
        style={{ position: "absolute", left: -120, top: 470 }}
      />
      <Footer />
      {showNarration ? <Captions /> : null}
      <Audio name="Voiceover" src={staticFile("voice/narration.wav")} />
    </AbsoluteFill>
  );
};
