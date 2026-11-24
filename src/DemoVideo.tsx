import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, Track, useVideoConfig } from "remotion";
import { Backdrop, Captions, Footer, TitleCard } from "./Chrome";
import { Knight } from "./Knight";
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
// Explainer-reel layout: title card on top, scenes drawn at 80% to the right of the knight,
// word chips above the footer bar.
export const DemoVideo = ({ showNarration }: DemoVideoProps) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ transformOrigin: "0px 0px", scale: 0.8, translate: "360px 130px" }}>
        <Track name="Scenes">
          <Hook name="0:00 The hook" from={0} durationInFrames={45 * fps} />
          <HowItWorks name="0:45 How the gateway works" from={45 * fps} durationInFrames={50 * fps} />
          <AllowBlock name="1:35 Allow the search, block the delete" from={95 * fps} durationInFrames={60 * fps} />
          <ApproveUndo name="2:35 Approve a change, then undo it" from={155 * fps} durationInFrames={65 * fps} />
          <AuditTrail name="3:40 The audit trail" from={220 * fps} durationInFrames={50 * fps} />
          <Close name="4:30 Close" from={270 * fps} durationInFrames={30 * fps} />
        </Track>
      </AbsoluteFill>
      <TitleCard />
      <Knight name="Knight narrator" style={{ position: "absolute", left: 6, bottom: 0 }} />
      <Footer />
      {showNarration ? <Captions /> : null}
      <Audio name="Knight voiceover" src={staticFile("voice/narration.wav")} />
    </AbsoluteFill>
  );
};
