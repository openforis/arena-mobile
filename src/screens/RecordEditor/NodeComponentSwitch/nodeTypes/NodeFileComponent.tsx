import { NodeDefFileType, Users } from "@openforis/arena-core";

import { Text } from "components";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { log } from "utils";

import { NodeAudioComponent } from "./NodeAudioComponent";
import { NodeImageOrVideoComponent } from "./NodeImageOrVideoComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

const supportedFileTypes = new Set([
  NodeDefFileType.other,
  NodeDefFileType.image,
  NodeDefFileType.video,
]);

export const NodeFileComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;

  log.debug(`rendering NodeFileComponent for ${nodeDef.props.name}`);

  const user = RemoteConnectionSelectors.useLoggedInUser();

  const { fileType = NodeDefFileType.other } = nodeDef.props;

  if (Users.isSystemAdmin(user) && fileType === NodeDefFileType.audio) {
    return <NodeAudioComponent {...props} />;
  }

  if (supportedFileTypes.has(fileType)) {
    return <NodeImageOrVideoComponent {...props} />;
  }

  return <Text textKey={`File type not supported (${fileType})`} />;
};
