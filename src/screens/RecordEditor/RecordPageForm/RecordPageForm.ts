import { NodeDefs } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";
import { NodeEntityFormComponent } from "../NodeComponentSwitch/nodeTypes/NodeEntityFormComponent";
import { NodeMultipleEntityComponent } from "../NodeMultipleEntityComponent";

export const RecordPageForm = () => {
  const { entityDef, entityUuid, parentEntityUuid } =
    DataEntrySelectors.useCurrentPageEntity();

  if (__DEV__) {
    console.log(`rendering RecordPageForm of ${NodeDefs.getName(entityDef)}`);
  }

  return NodeDefs.isRoot(entityDef) || NodeDefs.isSingle(entityDef) ? (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <NodeEntityFormComponent nodeDef={entityDef} parentNodeUuid={entityUuid} />
  ) : (
    // @ts-expect-error TS(2709): Cannot use namespace 'NodeMultipleEntityComponent'... Remove this comment to see the full error message
    <NodeMultipleEntityComponent
      // @ts-expect-error TS(2304): Cannot find name 'entityDef'.
      entityDef={entityDef}
      // @ts-expect-error TS(2304): Cannot find name 'parentEntityUuid'.
      parentEntityUuid={parentEntityUuid}
      // @ts-expect-error TS(2304): Cannot find name 'entityUuid'.
      entityUuid={entityUuid}
    />
  );
};
