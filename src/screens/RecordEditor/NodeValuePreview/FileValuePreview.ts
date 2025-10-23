import { NodeDefFileType } from "@openforis/arena-core";

import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";
import { ImageOrVideoValuePreview } from "./ImageOrVideoValuePreview";

export const FileValuePreview = (props: any) => {
  const { nodeDef, value } = props;

  const { fileType = NodeDefFileType.other } = nodeDef.props;

  if (fileType === NodeDefFileType.image) {
    // @ts-expect-error TS(7027): Unreachable code detected.
    return <ImageOrVideoValuePreview nodeDef={nodeDef} value={value} />;
  }

  return null;
};

FileValuePreview.propTypes = NodeValuePreviewPropTypes;
