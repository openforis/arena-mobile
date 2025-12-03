import { NodeDefType, NodeDefs } from "@openforis/arena-core";

import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";
import { log } from "utils";

import { NodeCodeComponent } from "./nodeTypes/NodeCodeComponent";
import { NodeMultipleEntityPreviewComponent } from "./nodeTypes/NodeMultipleEntityPreviewComponent";
import { NodeSingleEntityComponent } from "./nodeTypes/NodeSingleEntityComponent";

import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { MultipleAttributeComponentWrapper } from "./MultipleAttributeComponentWrapper";
import { NodeMultipleEntityComponent } from "../NodeMultipleEntityComponent";
import { NodeComponentProps } from "./nodeTypes/nodeComponentPropTypes";

type Props = NodeComponentProps & {
  onFocus?: () => void;
};

export const NodeComponentSwitch = (props: Props) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  log.debug(`rendering NodeComponentSwitch for ${nodeDef.props.name}`);

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  if (NodeDefs.isEntity(nodeDef)) {
    if (NodeDefs.isSingle(nodeDef)) {
      return (
        <NodeSingleEntityComponent
          nodeDef={nodeDef}
          parentNodeUuid={parentNodeUuid}
        />
      );
    }
    if (viewMode === RecordEditViewMode.oneNode) {
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
