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
    <NodeEntityFormComponent nodeDef={entityDef} parentNodeUuid={entityUuid} />
  ) : (
    <NodeMultipleEntityComponent
      entityDef={entityDef}
      parentEntityUuid={parentEntityUuid}
      entityUuid={entityUuid}
    />
  );
};
