import { NodeDefType, NodeDefs } from "@openforis/arena-core";

import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";
import { log } from "utils";

import { NodeCodeComponent } from "./nodeTypes/NodeCodeComponent";
import { NodeMultipleEntityPreviewComponent } from "./nodeTypes/NodeMultipleEntityPreviewComponent";

import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { MultipleAttributeComponentWrapper } from "./MultipleAttributeComponentWrapper";
import { NodeComponentProps } from "./nodeTypes/nodeComponentPropTypes";

// Entity components render NodeDefFormItem, which renders NodeComponentSwitch again:
// require them lazily (at render time) to avoid a require cycle at module load time.
const getNodeSingleEntityComponent = () =>
  (
    require("./nodeTypes/NodeSingleEntityComponent") as typeof import("./nodeTypes/NodeSingleEntityComponent")
  ).NodeSingleEntityComponent;

const getNodeMultipleEntityComponent = () =>
  (
    require("../NodeMultipleEntityComponent") as typeof import("../NodeMultipleEntityComponent")
  ).NodeMultipleEntityComponent;

type Props = NodeComponentProps & {
  onFocus?: () => void;
};

export const NodeComponentSwitch = (props: Props) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  log.debug(`rendering NodeComponentSwitch for ${nodeDef.props.name}`);

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  if (NodeDefs.isEntity(nodeDef)) {
    if (NodeDefs.isSingle(nodeDef)) {
      const NodeSingleEntityComponent = getNodeSingleEntityComponent();
      return (
        <NodeSingleEntityComponent
          nodeDef={nodeDef}
          parentNodeUuid={parentNodeUuid}
        />
      );
    }
    if (viewMode === RecordEditViewMode.oneNode) {
      const NodeMultipleEntityComponent = getNodeMultipleEntityComponent();
      return (
        <NodeMultipleEntityComponent
          entityDef={nodeDef}
          parentEntityUuid={parentNodeUuid}
        />
      );
    }
    return (
      <NodeMultipleEntityPreviewComponent
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
      />
    );
  }

  if (NodeDefs.isSingle(nodeDef)) {
    return (
      <SingleAttributeComponentSwitch
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
        onFocus={onFocus}
      />
    );
  }

  if (nodeDef.type === NodeDefType.code) {
    return (
      <NodeCodeComponent nodeDef={nodeDef} parentNodeUuid={parentNodeUuid} />
    );
  }

  return (
    <MultipleAttributeComponentWrapper
      nodeDef={nodeDef}
      parentNodeUuid={parentNodeUuid}
    />
  );
};
