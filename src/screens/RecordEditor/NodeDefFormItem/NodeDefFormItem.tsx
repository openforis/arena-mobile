import React, { useState } from "react";

import { NodeDefs, Objects } from "@openforis/arena-core";

import {
  DataEntrySelectors,
  SettingsSelectors,
  SurveySelectors,
  SurveyOptionsSelectors,
} from "state";
import { log } from "utils";

import { IconButton, Fade, VView } from "components";
import { RecordEditViewMode } from "model";

import { CurrentRecordNodeValuePreview } from "../CurrentRecordNodeValuePreview";
import { NodeComponentSwitch } from "../NodeComponentSwitch/NodeComponentSwitch";
import { PreviousCycleNodeValuePreview } from "../PreviousCycleNodeValuePreview";
import { NodeDefFormItemHeader } from "./NodeDefFormItemHeader";

import { useStyles } from "./styles";

type NodeDefFormItemProps = {
  nodeDef: any;
  parentNodeUuid?: string;
  onFocus?: () => void;
};

export const NodeDefFormItem = (props: NodeDefFormItemProps) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  log.debug(`Rendering form item ${NodeDefs.getName(nodeDef)}`);

  const { uuid: nodeDefUuid } = nodeDef;

  const styles = useStyles();
  const settings = SettingsSelectors.useSettings();

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const cycle = DataEntrySelectors.useRecordCycle();
  const isNodeDefEnumerator = SurveySelectors.useIsNodeDefEnumerator(nodeDef);
  const visible = DataEntrySelectors.useRecordNodePointerVisibility({
    parentNodeUuid,
    nodeDefUuid,
  });
  const keyAttributeLockAvailable =
    NodeDefs.isKey(nodeDef) &&
    !NodeDefs.isEntity(nodeDef) &&
    !isNodeDefEnumerator;
  const isRecordAttributeFilled = DataEntrySelectors.useIsRecordAttributeFilled(
    {
      parentNodeUuid,
      nodeDef,
    },
  );
  const keyAttributeFilled =
    keyAttributeLockAvailable && isRecordAttributeFilled;
  const contentKey = `${parentNodeUuid ?? "root"}:${nodeDefUuid}:${keyAttributeFilled ? "filled" : "empty"}`;
  const isLinkedToPreviousCycleRecord =
    DataEntrySelectors.useIsLinkedToPreviousCycleRecord();
  const canEditRecord = DataEntrySelectors.useCanEditRecord();
  const alwaysVisible = Objects.isEmpty(NodeDefs.getApplicable(nodeDef));
  const [keyAttributeLockState, setKeyAttributeLockState] = useState({
    contentKey,
    locked: keyAttributeFilled,
  });

  const includedInPreviousCycleLink =
    !NodeDefs.isKey(nodeDef) &&
    NodeDefs.isIncludedInPreviousCycleLink(cycle)(nodeDef);

  const keyAttributeLocked =
    keyAttributeLockState.contentKey === contentKey
      ? keyAttributeLockState.locked
      : keyAttributeFilled;

  const keyAttributeLockButton =
    canEditRecord && keyAttributeFilled ? (
      <IconButton
        icon={keyAttributeLocked ? "lock-outline" : "lock-open-variant-outline"}
        onPress={() =>
          setKeyAttributeLockState((statePrev) => {
            const lockedPrev =
              statePrev.contentKey === contentKey
                ? statePrev.locked
                : keyAttributeFilled;
            return {
              contentKey,
              locked: !lockedPrev,
            };
          })
        }
        size={20}
        style={styles.headerIconButton}
      />
    ) : null;

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
        startAccessory={keyAttributeLockButton}
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
        {canEditRecord && !keyAttributeLocked ? (
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
