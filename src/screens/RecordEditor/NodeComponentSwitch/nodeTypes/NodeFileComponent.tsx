import { NodeDefFileType } from "@openforis/arena-core";

import { Text } from "components";
import { NodeImageOrVideoComponent } from "./NodeImageOrVideoComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

const supportedFileTypes = new Set([
  NodeDefFileType.other,
  NodeDefFileType.image,
  NodeDefFileType.video,
]);

export const NodeFileComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;

  if (__DEV__) {
    console.log(`rendering NodeFileComponent for ${nodeDef.props.name}`);
  }

  const { fileType = NodeDefFileType.other } = nodeDef.props;

  if (supportedFileTypes.has(fileType)) {
    return <NodeImageOrVideoComponent {...props} />;
  }

  return <Text textKey={`File type not supported (${fileType})`} />;
};
