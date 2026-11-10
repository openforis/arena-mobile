import { createElement } from "react";

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
// require returns the same (cached) component every time: rendered with createElement.
const getNodeSingleEntityComponent = () =>
  (
    require("./nodeTypes/NodeSingleEntityComponent") as typeof import("./nodeTypes/NodeSingleEntityComponent")
  ).NodeSingleEntityComponent;

const getNodeMultipleEntityComponent = () =>
  (
    require("../NodeMultipleEntityComponent") as typeof import("../NodeMultipleEntityComponent")
  ).NodeMultipleEntityComponent;

export const NodeComponentSwitch = (props: NodeComponentProps) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug(`rendering NodeComponentSwitch for ${nodeDef.props.name}`);

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  if (NodeDefs.isEntity(nodeDef)) {
    if (NodeDefs.isSingle(nodeDef)) {
      return createElement(getNodeSingleEntityComponent(), {
        nodeDef,
        parentNodeUuid,
      });
    }
    if (viewMode === RecordEditViewMode.oneNode) {
      return createElement(getNodeMultipleEntityComponent(), {
        entityDef: nodeDef,
        parentEntityUuid: parentNodeUuid,
      });
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
