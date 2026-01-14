import { NodeDefs } from "@openforis/arena-core";

import { Text } from "components";

import { NodeTextReadOnlyValuePreview } from "./NodeTextReadOnlyValuePreview";
import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

export const TextValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value, valueFormatted } = props;

  if (NodeDefs.isReadOnly(nodeDef)) {
    return (
      <NodeTextReadOnlyValuePreview
        nodeDef={nodeDef}
        value={value}
        valueFormatted={valueFormatted}
      />
    );
  }
  return <Text>{valueFormatted}</Text>;
};
