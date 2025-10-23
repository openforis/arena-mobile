import { NodeDefType, NodeDefs } from "@openforis/arena-core";

import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";

import { NodeCodeComponent } from "./nodeTypes/NodeCodeComponent";
import { NodeMultipleEntityPreviewComponent } from "./nodeTypes/NodeMultipleEntityPreviewComponent";
import { NodeSingleEntityComponent } from "./nodeTypes/NodeSingleEntityComponent";

import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { MultipleAttributeComponentWrapper } from "./MultipleAttributeComponentWrapper";
import { NodeMultipleEntityComponent } from "../NodeMultipleEntityComponent";
import { NodeComponentPropTypes } from "./nodeTypes/nodeComponentPropTypes";

// @ts-expect-error TS(7030): Not all code paths return a value.
export const NodeComponentSwitch = (props: any) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  if (__DEV__) {
    console.log(`rendering NodeComponentSwitch for ${nodeDef.props.name}`);
  }

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  if (NodeDefs.isEntity(nodeDef)) {
    if (NodeDefs.isSingle(nodeDef)) {
      return (
        // @ts-expect-error TS(2709): Cannot use namespace 'NodeSingleEntityComponent' a... Remove this comment to see the full error message
        <NodeSingleEntityComponent
          nodeDef={nodeDef}
          // @ts-expect-error TS(7027): Unreachable code detected.
          parentNodeUuid={parentNodeUuid}
        />
      );
    }
    // @ts-expect-error TS(2304): Cannot find name 'viewMode'.
    if (viewMode === RecordEditViewMode.oneNode) {
      return (
        <NodeMultipleEntityComponent
          entityDef={nodeDef}
          // @ts-expect-error TS(7027): Unreachable code detected.
          parentEntityUuid={parentNodeUuid}
        />
      );
    }
    return (
      <NodeMultipleEntityPreviewComponent
        nodeDef={nodeDef}
        // @ts-expect-error TS(7027): Unreachable code detected.
        parentNodeUuid={parentNodeUuid}
      />
    );
  }

  // @ts-expect-error TS(2552): Cannot find name 'nodeDef'. Did you mean 'NodeDefs... Remove this comment to see the full error message
  if (NodeDefs.isSingle(nodeDef)) {
    return (
      <SingleAttributeComponentSwitch
        nodeDef={nodeDef}
        // @ts-expect-error TS(2304): Cannot find name 'parentNodeUuid'.
        parentNodeUuid={parentNodeUuid}
        // @ts-expect-error TS(2304): Cannot find name 'onFocus'.
        onFocus={onFocus}
      />
    );
  }

  // @ts-expect-error TS(2304): Cannot find name 'nodeDef'.
  if (nodeDef.type === NodeDefType.code) {
    return (
      <NodeCodeComponent
        nodeDef={nodeDef}
        // @ts-expect-error TS(2304): Cannot find name 'parentNodeUuid'.
        parentNodeUuid={parentNodeUuid}
        // @ts-expect-error TS(2304): Cannot find name 'onFocus'.
        onFocus={onFocus}
      />
    );
  }

  return (
    <MultipleAttributeComponentWrapper
      nodeDef={nodeDef}
      // @ts-expect-error TS(2304): Cannot find name 'parentNodeUuid'.
      parentNodeUuid={parentNodeUuid}
    />
  );
};

NodeComponentSwitch.propTypes = NodeComponentPropTypes;
