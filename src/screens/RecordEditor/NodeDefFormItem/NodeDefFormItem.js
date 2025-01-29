import React from "react";
import PropTypes from "prop-types";

import { NodeDefs, Objects } from "@openforis/arena-core";

import {
  DataEntrySelectors,
  SettingsSelectors,
  SurveyOptionsSelectors,
} from "state";

import { Fade, VView } from "components";
import { RecordEditViewMode } from "model";

import { NodeComponentSwitch } from "../NodeComponentSwitch/NodeComponentSwitch";
import { NodeDefFormItemHeader } from "./NodeDefFormItemHeader";
import { CurrentRecordNodeValuePreview } from "../CurrentRecordNodeValuePreview";
import { PreviousCycleNodeValuePreview } from "../PreviousCycleNodeValuePreview";

import { useStyles } from "./styles";

export const NodeDefFormItem = (props) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  if (__DEV__) {
    console.log(`Rendering form item ${nodeDef.props.name}`);
  }
  const styles = useStyles();
  const settings = SettingsSelectors.useSettings();

  const alwaysVisible = Objects.isEmpty(NodeDefs.getApplicable(nodeDef));

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const visible = DataEntrySelectors.useRecordNodePointerVisibility({
    parentNodeUuid,
    nodeDefUuid: nodeDef.uuid,
  });
  const isLinkedToPreviousCycleRecord =
    DataEntrySelectors.useIsLinkedToPreviousCycleRecord();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();

  const formItemComponent = (
    <VView
      style={[
        styles.formItem,
        viewMode === RecordEditViewMode.oneNode ? styles.formItemOneNode : {},
      ]}
    >
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
        {isLinkedToPreviousCycleRecord && (
          <PreviousCycleNodeValuePreview nodeDef={nodeDef} />
        )}
        {canEditRecord ? (
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
