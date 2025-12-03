import React from "react";

import { NodeDefs, Objects } from "@openforis/arena-core";

import {
  DataEntrySelectors,
  SettingsSelectors,
  SurveyOptionsSelectors,
} from "state";
import { log } from "utils";

import { Fade, VView } from "components";
import { RecordEditViewMode } from "model";

import { NodeComponentSwitch } from "../NodeComponentSwitch/NodeComponentSwitch";
import { NodeDefFormItemHeader } from "./NodeDefFormItemHeader";
import { CurrentRecordNodeValuePreview } from "../CurrentRecordNodeValuePreview";
import { PreviousCycleNodeValuePreview } from "../PreviousCycleNodeValuePreview";

import { useStyles } from "./styles";

type NodeDefFormItemProps = {
  nodeDef: any;
  parentNodeUuid?: string;
  onFocus?: () => void;
};

export const NodeDefFormItem = (props: NodeDefFormItemProps) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  log.debug(`Rendering form item ${nodeDef.props.name}`);
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
