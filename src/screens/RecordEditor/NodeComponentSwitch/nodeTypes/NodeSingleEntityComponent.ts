// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { FieldSet } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
    <FieldSet headerKey={nodeDef.props.name}>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <NodeEntityFormComponent nodeDef={nodeDef} parentNodeUuid={nodeUuid} />
    </FieldSet>
  );
};

NodeSingleEntityComponent.propTypes = NodeComponentPropTypes;
