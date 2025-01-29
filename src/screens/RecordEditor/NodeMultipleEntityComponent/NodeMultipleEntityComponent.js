import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";
import { NodeEntityFormComponent } from "../NodeComponentSwitch/nodeTypes/NodeEntityFormComponent";
import { NodeMultipleEntityListComponent } from "./NodeMultipleEntityListComponent";
import { RecordNodesCarousel } from "../RecordNodesCarousel";

export const NodeMultipleEntityComponent = (props) => {
  const { entityDef, parentEntityUuid, entityUuid } = props;

  if (__DEV__) {
    console.log(
      "Rendering NodeMultipleEntityComponent for " + NodeDefs.getName(entityDef)
    );
  }

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

NodeMultipleEntityComponent.propTypes = {
  entityDef: PropTypes.object.isRequired,
  parentEntityUuid: PropTypes.string,
  entityUuid: PropTypes.string,
};
