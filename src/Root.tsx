import { Composition, Folder } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { AllowBlock } from "./scenes/AllowBlock";
import { ApproveUndo } from "./scenes/ApproveUndo";
import { AuditTrail } from "./scenes/AuditTrail";
import { Close } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { HowItWorks } from "./scenes/HowItWorks";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot = () => (
  <>
    <Composition
      id="SafeModeGatewayDemo"
      component={DemoVideo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={9000}
      defaultProps={{ showNarration: true }}
    />
    <Composition id="Thumbnail" component={Thumbnail} width={1280} height={720} fps={30} durationInFrames={1} />
    <Folder name="Scenes">
      <Composition id="Hook" component={Hook} width={1920} height={1080} fps={30} durationInFrames={1350} defaultProps={{ style: { backgroundColor: "#FFFFFF" } }} />
      <Composition id="HowItWorks" component={HowItWorks} width={1920} height={1080} fps={30} durationInFrames={1500} defaultProps={{ style: { backgroundColor: "#FFFFFF" } }} />
      <Composition id="AllowBlock" component={AllowBlock} width={1920} height={1080} fps={30} durationInFrames={1800} defaultProps={{ style: { backgroundColor: "#FFFFFF" } }} />
      <Composition id="ApproveUndo" component={ApproveUndo} width={1920} height={1080} fps={30} durationInFrames={1950} defaultProps={{ style: { backgroundColor: "#FFFFFF" } }} />
      <Composition id="AuditTrail" component={AuditTrail} width={1920} height={1080} fps={30} durationInFrames={1500} defaultProps={{ style: { backgroundColor: "#FFFFFF" } }} />
      <Composition id="Close" component={Close} width={1920} height={1080} fps={30} durationInFrames={900} defaultProps={{ style: { backgroundColor: "#FFFFFF" } }} />
    </Folder>
  </>
);
