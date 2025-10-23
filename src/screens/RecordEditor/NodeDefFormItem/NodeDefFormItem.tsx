import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs, Objects } from "@openforis/arena-core";

import {
  DataEntrySelectors,
  SettingsSelectors,
  SurveyOptionsSelectors,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
} from "state";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Fade, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordEditViewMode } from "model";

import { NodeComponentSwitch } from "../NodeComponentSwitch/NodeComponentSwitch";
import { NodeDefFormItemHeader } from "./NodeDefFormItemHeader";
import { CurrentRecordNodeValuePreview } from "../CurrentRecordNodeValuePreview";
import { PreviousCycleNodeValuePreview } from "../PreviousCycleNodeValuePreview";

import { useStyles } from "./styles";

export const NodeDefFormItem = (props: any) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  if (__DEV__) {
    console.log(`Rendering form item ${nodeDef.props.name}`);
  }
  const styles = useStyles();
  const settings = SettingsSelectors.useSettings();

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const cycle = DataEntrySelectors.useRecordCycle();
  const visible = DataEntrySelectors.useRecordNodePointerVisibility({
    parentNodeUuid,
    nodeDefUuid: nodeDef.uuid,
  });
  const isLinkedToPreviousCycleRecord =
    DataEntrySelectors.useIsLinkedToPreviousCycleRecord();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();
  const alwaysVisible = Objects.isEmpty(NodeDefs.getApplicable(nodeDef));

  const includedInPreviousCycleLink =
    !NodeDefs.isKey(nodeDef) &&
    NodeDefs.isIncludedInPreviousCycleLink(cycle)(nodeDef);

  const formItemComponent = (
    <VView
      style={[
        styles.formItem,
        viewMode === RecordEditViewMode.oneNode ? styles.formItemOneNode : {},
      ]}
    >
      // @ts-expect-error TS(2786): 'NodeDefFormItemHeader' cannot be used as a JSX co... Remove this comment to see the full error message
      <NodeDefFormItemHeader
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
      />
      <VView
        style={[
          styles.internalContainer,
          viewMode === RecordEditViewMode.oneNode ? { flex: 1 } : {},
        ]}
      >
        {isLinkedToPreviousCycleRecord && includedInPreviousCycleLink && (
          // @ts-expect-error TS(2786): 'PreviousCycleNodeValuePreview' cannot be used as ... Remove this comment to see the full error message
          <PreviousCycleNodeValuePreview nodeDef={nodeDef} />
        )}
        {canEditRecord ? (
          // @ts-expect-error TS(2786): 'NodeComponentSwitch' cannot be used as a JSX comp... Remove this comment to see the full error message
          <NodeComponentSwitch
            nodeDef={nodeDef}
            parentNodeUuid={parentNodeUuid}
            onFocus={onFocus}
          />
        ) : (
          <CurrentRecordNodeValuePreview
            nodeDef={nodeDef}
            parentNodeUuid={parentNodeUuid}
          />
        )}
      </VView>
    </VView>
  );

  if (alwaysVisible) {
    return formItemComponent;
  }

  if (settings.animationsEnabled && viewMode !== RecordEditViewMode.oneNode) {
    return <Fade visible={visible}>{formItemComponent}</Fade>;
  }

  return visible ? formItemComponent : null;
};

NodeDefFormItem.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  parentNodeUuid: PropTypes.string,
  onFocus: PropTypes.func,
};
