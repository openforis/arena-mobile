import { NodeDefFileType, NodeDefs } from "@openforis/arena-core";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";
import { ImageOrVideoValuePreview } from "./ImageOrVideoValuePreview";

export const FileValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const fileType = NodeDefs.getFileType(nodeDef) ?? NodeDefFileType.other;

  if (fileType === NodeDefFileType.image) {
    return <ImageOrVideoValuePreview nodeDef={nodeDef} value={value} />;
  }

  return null;
};
