import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

import { AudioPlayback } from "components/audio";
import { RecordFileService } from "service/recordFileService";
import { SurveySelectors } from "state/survey";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";
import { ImageOrVideoValuePreview } from "./ImageOrVideoValuePreview";

export const FileValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const surveyId = SurveySelectors.useCurrentSurveyId();

  const fileType = NodeDefs.getFileType(nodeDef) ?? NodeDefFileType.other;

  if (fileType === NodeDefFileType.image) {
    return <ImageOrVideoValuePreview nodeDef={nodeDef} value={value} />;
  }

  if (fileType === NodeDefFileType.audio) {
    const fileUuid = value?.fileUuid;
    const fileUri = fileUuid
      ? RecordFileService.getRecordFileUri({ surveyId, fileUuid })
      : null;
    if (!fileUri) {
      return null;
    }
    return <AudioPlayback fileUri={fileUri} />;
  }

  return null;
};
