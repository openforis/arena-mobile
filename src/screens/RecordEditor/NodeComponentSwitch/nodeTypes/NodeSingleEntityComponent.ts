import { FieldSet } from "components";
import { DataEntrySelectors } from "state";

import { NodeEntityFormComponent } from "./NodeEntityFormComponent";
import { NodeComponentPropTypes } from "./nodeComponentPropTypes";

export const NodeSingleEntityComponent = (props) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log("rendering NodeSingleEntityComponent");
  }

  const nodeUuid = DataEntrySelectors.useRecordSingleNodeUuid({
    parentNodeUuid,
    nodeDefUuid: nodeDef.uuid,
  });

  if (!nodeUuid) return null;

  return (
    <FieldSet headerKey={nodeDef.props.name}>
      <NodeEntityFormComponent nodeDef={nodeDef} parentNodeUuid={nodeUuid} />
    </FieldSet>
  );
};

NodeSingleEntityComponent.propTypes = NodeComponentPropTypes;
