// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";
import { NodeEntityFormComponent } from "../NodeComponentSwitch/nodeTypes/NodeEntityFormComponent";
import { NodeMultipleEntityListComponent } from "./NodeMultipleEntityListComponent";
import { RecordNodesCarousel } from "../RecordNodesCarousel";

export const NodeMultipleEntityComponent = (props: any) => {
  const { entityDef, parentEntityUuid, entityUuid } = props;

  if (__DEV__) {
    console.log(
      "Rendering NodeMultipleEntityComponent for " + NodeDefs.getName(entityDef)
    );
  }

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  if (entityUuid) {
    if (viewMode === RecordEditViewMode.oneNode) {
      // @ts-expect-error TS(2749): 'RecordNodesCarousel' refers to a value, but is be... Remove this comment to see the full error message
      return <RecordNodesCarousel />;
    }
    return (
      // @ts-expect-error TS(2709): Cannot use namespace 'NodeEntityFormComponent' as ... Remove this comment to see the full error message
      <NodeEntityFormComponent
        // @ts-expect-error TS(2552): Cannot find name 'nodeDef'. Did you mean 'NodeDefs... Remove this comment to see the full error message
        nodeDef={entityDef}
        // @ts-expect-error TS(7027): Unreachable code detected.
        parentNodeUuid={entityUuid}
      />
    );
  }

  return (
    <NodeMultipleEntityListComponent
      entityDef={entityDef}
      // @ts-expect-error TS(7027): Unreachable code detected.
      parentEntityUuid={parentEntityUuid}
    />
  );
};

NodeMultipleEntityComponent.propTypes = {
  entityDef: PropTypes.object.isRequired,
  parentEntityUuid: PropTypes.string,
  entityUuid: PropTypes.string,
};
