import React, { useMemo } from "react";

import { NodeDefs, Objects } from "@openforis/arena-core";

import { Fade, VView } from "components";
import { RecordEditViewMode } from "model";
import {
  DataEntrySelectors,
  SettingsSelectors,
  SurveyOptionsSelectors,
  SurveySelectors,
} from "state";
import { log } from "utils";

import { CurrentRecordNodeValuePreview } from "../CurrentRecordNodeValuePreview";
import { NodeComponentSwitch } from "../NodeComponentSwitch/NodeComponentSwitch";
import { NodeComponentProps } from "../NodeComponentSwitch/nodeTypes/nodeComponentPropTypes";
import { PreviousCycleNodeValuePreview } from "../PreviousCycleNodeValuePreview";

import { KeyAttributeLockButton } from "./KeyAttributeLockButton";
import { NodeDefFormItemHeader } from "./NodeDefFormItemHeader";
import { useKeyAttributeLock } from "./useKeyAttributeLock";

import { useStyles } from "./styles";

export const NodeDefFormItem = (props: NodeComponentProps) => {
  const { nodeDef, parentNodeUuid, onFocus } = props;

  log.debug(`rendering NodeDefFormItem for ${NodeDefs.getName(nodeDef)}`);

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
  const editable = DataEntrySelectors.useRecordNodePointerEditable({
    parentNodeUuid,
    nodeDefUuid,
  });
  const keyAttributeLockAvailable =
    NodeDefs.isKey(nodeDef) &&
    !NodeDefs.isEntity(nodeDef) &&
    !NodeDefs.isReadOnly(nodeDef) &&
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
  const hasRelevantIf = Objects.isNotEmpty(NodeDefs.getApplicable(nodeDef));

  const includedInPreviousCycleLink =
    !NodeDefs.isKey(nodeDef) &&
    NodeDefs.isIncludedInPreviousCycleLink(cycle)(nodeDef);

  const { canDisplayKeyLockButton, keyAttributeLocked, onKeyLockButtonPress } =
    useKeyAttributeLock({
      canEditRecord,
      contentKey,
      keyAttributeFilled,
      keyAttributeLockAvailable,
    });

  const keyAttributeLockButton = useMemo(
    () =>
      canDisplayKeyLockButton ? (
        <KeyAttributeLockButton
          keyAttributeLocked={keyAttributeLocked}
          onPress={onKeyLockButtonPress}
        />
      ) : null,
    [canDisplayKeyLockButton, keyAttributeLocked, onKeyLockButtonPress],
  );

  const formItemComponentStyle = useMemo(
    () => [
      styles.formItem,
      viewMode === RecordEditViewMode.oneNode ? styles.formItemOneNode : {},
    ],
    [viewMode, styles.formItem, styles.formItemOneNode],
  );

  const internalContainerStyle = useMemo(
    () => [
      styles.internalContainer,
      viewMode === RecordEditViewMode.oneNode ? { flex: 1 } : {},
    ],
    [viewMode, styles.internalContainer],
  );

  const formItemComponent = useMemo(
    () => (
      <VView style={formItemComponentStyle}>
        <NodeDefFormItemHeader
          nodeDef={nodeDef}
          parentNodeUuid={parentNodeUuid}
          startAccessory={keyAttributeLockButton}
        />
        <VView style={internalContainerStyle}>
          {isLinkedToPreviousCycleRecord && includedInPreviousCycleLink && (
            <PreviousCycleNodeValuePreview nodeDef={nodeDef} />
          )}
          {canEditRecord && editable && !keyAttributeLocked ? (
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
    ),
    [
      canEditRecord,
      editable,
      formItemComponentStyle,
      includedInPreviousCycleLink,
      internalContainerStyle,
      isLinkedToPreviousCycleRecord,
      keyAttributeLockButton,
      keyAttributeLocked,
      nodeDef,
      onFocus,
      parentNodeUuid,
    ],
  );

  if (!visible) {
    return null;
  }

  if (
    hasRelevantIf &&
    settings.animationsEnabled &&
    viewMode !== RecordEditViewMode.oneNode
  ) {
    return <Fade visible={visible}>{formItemComponent}</Fade>;
  }

  return formItemComponent;
};
