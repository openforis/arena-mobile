import { NodeDefFileType } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text } from "components";
import { NodeImageOrVideoComponent } from "./NodeImageOrVideoComponent";
import { NodeComponentPropTypes } from "./nodeComponentPropTypes";

const supportedFileTypes = [
  NodeDefFileType.other,
  NodeDefFileType.image,
  NodeDefFileType.video,
];

export const NodeFileComponent = (props: any) => {
  const { nodeDef } = props;

  if (__DEV__) {
    console.log(`rendering NodeFileComponent for ${nodeDef.props.name}`);
  }

  const { fileType = NodeDefFileType.other } = nodeDef.props;

  if (supportedFileTypes.includes(fileType)) {
    // @ts-expect-error TS(2709): Cannot use namespace 'NodeImageOrVideoComponent' a... Remove this comment to see the full error message
    return <NodeImageOrVideoComponent {...props} />;
  }

  // @ts-expect-error TS(7027): Unreachable code detected.
  return <Text textKey={`File type not supported (${fileType})`} />;
};

NodeFileComponent.propTypes = NodeComponentPropTypes;
