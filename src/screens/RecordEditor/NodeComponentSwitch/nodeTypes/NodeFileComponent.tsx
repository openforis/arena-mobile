import { memo } from "react";

import { NodeDefFile, NodeDefFileType } from "@openforis/arena-core";

import { Text } from "components";
import { log } from "utils";

import { NodeAudioComponent } from "./NodeAudioComponent";
import { NodeImageOrVideoComponent } from "./NodeImageOrVideoComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

const supportedFileTypes = new Set([
  NodeDefFileType.other,
  NodeDefFileType.image,
  NodeDefFileType.video,
]);

type Props = NodeComponentProps<NodeDefFile>;

export const NodeFileComponent = memo((props: Props) => {
  const { nodeDef } = props;

  log.debug(`rendering NodeFileComponent for ${nodeDef.props.name}`);

  const { fileType = NodeDefFileType.other } = nodeDef.props;

  if (fileType === NodeDefFileType.audio) {
    return <NodeAudioComponent {...props} />;
  }

  if (supportedFileTypes.has(fileType)) {
    return <NodeImageOrVideoComponent {...props} />;
  }

  return <Text textKey={`File type not supported (${fileType})`} />;
});

NodeFileComponent.displayName = "NodeFileComponent";
