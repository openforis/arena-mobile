import { NodeDefs } from "@openforis/arena-core";

import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";
import { log } from "utils";
import { NodeEntityFormComponent } from "../NodeComponentSwitch/nodeTypes/NodeEntityFormComponent";
import { NodeMultipleEntityListComponent } from "./NodeMultipleEntityListComponent";
import { RecordNodesCarousel } from "../RecordNodesCarousel";

type NodeMultipleEntityComponentProps = {
  entityDef: any;
  parentEntityUuid?: string;
  entityUuid?: string;
};

export const NodeMultipleEntityComponent = (
  props: NodeMultipleEntityComponentProps
) => {
  const { entityDef, parentEntityUuid, entityUuid } = props;

  log.debug(
    "Rendering NodeMultipleEntityComponent for " + NodeDefs.getName(entityDef)
  );

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  if (entityUuid) {
    if (viewMode === RecordEditViewMode.oneNode) {
      return <RecordNodesCarousel />;
    }
    return (
      <NodeEntityFormComponent
        nodeDef={entityDef}
        parentNodeUuid={entityUuid}
      />
    );
  }

  return (
    <NodeMultipleEntityListComponent
      entityDef={entityDef}
      parentEntityUuid={parentEntityUuid}
    />
  );
};
