import { FieldSet } from "components";
import { DataEntrySelectors } from "state";

import { NodeEntityFormComponent } from "./NodeEntityFormComponent";
import { NodeComponentPropTypes } from "./nodeComponentPropTypes";

export const NodeSingleEntityComponent = (props: any) => {
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
    // @ts-expect-error TS(2709): Cannot use namespace 'FieldSet' as a type.
    <FieldSet headerKey={nodeDef.props.name}>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <NodeEntityFormComponent nodeDef={nodeDef} parentNodeUuid={nodeUuid} />
    </FieldSet>
  );
};

NodeSingleEntityComponent.propTypes = NodeComponentPropTypes;
