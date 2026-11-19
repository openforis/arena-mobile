import { memo } from "react";

import {
  ArenaNodeDefFile,
  NodeDefFileType,
  NodeDefs,
} from "@openforis/arena-core";

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

type Props = NodeComponentProps<ArenaNodeDefFile>;

export const NodeFileComponent = memo((props: Props) => {
  const { nodeDef } = props;

  log.debug(`rendering NodeFileComponent for ${NodeDefs.getName(nodeDef)}`);

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
