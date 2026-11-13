import {
  LanguageCode,
  NodeDefs,
  Nodes,
  NodesMap,
  Survey,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import { SurveyDefs } from "model";
import { RecordService } from "service/recordService";

import { Errors, log, StringUtils } from "utils";
import { PreviewMode } from "utils/PreviewMode";
import { i18n } from "localization";

import { AutoSyncActions } from "../autoSync";
import { ConfirmUtils } from "../confirm";

import { DataEntryActionTypes } from "./actionTypes";
import { DataEntrySelectors } from "./selectors";
import { ToastActions } from "state/toast";
import type { AppDispatch, AppGetState } from "../store";

const { RECORD_SET } = DataEntryActionTypes;

export const handleError = (
  dispatch: AppDispatch,
  error: any,
  messageKey: string,
  messageParams = {},
) => {
  const errorMessage = Errors.getErrorMessage(error);
  const params = { ...messageParams, error: errorMessage };
  log.error(i18n.t(messageKey, params));
  dispatch(ToastActions.show(messageKey, params));
};

export const removeNodesFlags = (nodes: NodesMap) => {
  for (const node of Object.values(nodes)) {
    Nodes.removeStatusFlags({ node, sideEffect: true });
  }
};

// the record open in the editor can't be modified while it's being merged with its server copy
// (see lockOpenRecordForSync): the editor is read-only meanwhile, this stops an edit already on
// its way (e.g. a debounced text update) from overwriting the merged version
export const isRecordSyncInProgress = (
  dispatch: AppDispatch,
  getState: AppGetState,
): boolean => {
  if (!DataEntrySelectors.selectRecordSyncInProgress(getState())) return false;
  dispatch(ToastActions.show("dataEntry:autoSync.recordSyncInProgress"));
  return true;
};

export const prepareRecordForStorage = ({ record }: any) => {
  const validation = Validations.getValidation(record);
  const validationUpdated = Validations.updateCounts(validation);
  return { ...record, validation: validationUpdated };
};

// the editor may have been closed (or another record opened) while the update was being prepared
const isRecordStillOpen = (getState: AppGetState, record: any): boolean =>
  DataEntrySelectors.selectRecordUnsafe(getState())?.uuid === record.uuid;

export const updateRecord = async ({
  dispatch,
  getState,
  survey,
  record,
}: {
  dispatch: AppDispatch;
  getState: AppGetState;
  survey: any;
  record: any;
}) => {
  const recordUpdated = prepareRecordForStorage({ record });
  if (PreviewMode.isActive) {
    // record kept in memory only
    if (isRecordStillOpen(getState, record)) {
      await dispatch({ type: RECORD_SET, record: recordUpdated });
    }
    return recordUpdated;
  }
  const recordStored = await RecordService.updateRecord({
    survey,
    record: recordUpdated,
  });
  dispatch(AutoSyncActions.markPending());
  if (isRecordStillOpen(getState, record)) {
    await dispatch({ type: RECORD_SET, record: recordStored });
  }
  return recordStored;
};

const findNewlyInapplicableNodeDefNames = ({
  survey,
  lang,
  clearedDefUuids,
}: {
  survey: Survey;
  lang: LanguageCode;
  clearedDefUuids: Set<string>;
}): string[] => {
  if (clearedDefUuids.size === 0) return [];

  // Separate deleted multiple entity defs from individual attribute defs
  const deletedMultipleEntityDefUuids = new Set<string>();
  const otherDefUuids: string[] = [];

  for (const defUuid of clearedDefUuids) {
    const nodeDef = Surveys.getNodeDefByUuid({ survey, uuid: defUuid });
    if (nodeDef && NodeDefs.isMultipleEntity(nodeDef)) {
      deletedMultipleEntityDefUuids.add(defUuid);
    } else {
      otherDefUuids.push(defUuid);
    }
  }

  // Keep only attributes not inside a multiple entity that is being deleted
  const standaloneDefUuids = otherDefUuids.filter((defUuid) => {
    const nodeDef = Surveys.getNodeDefByUuid({ survey, uuid: defUuid });
    if (!nodeDef) return false;
    const ancestorMultipleEntity = Surveys.getNodeDefAncestorMultipleEntity({
      survey,
      nodeDef,
    });
    return (
      !ancestorMultipleEntity ||
      !deletedMultipleEntityDefUuids.has(ancestorMultipleEntity.uuid)
    );
  });

  // Entity names first, then standalone attribute names
  const defsToShow = [
    ...Array.from(deletedMultipleEntityDefUuids),
    ...standaloneDefUuids,
  ];

  if (defsToShow.length === 0) return [];

  const maxToShow = 10;
  const overflow = defsToShow.length - maxToShow;
  const nodeDefUuidsToShow = defsToShow.slice(0, maxToShow);
  const attributeNames = SurveyDefs.getNodeDefsLabelsOrNames({
    survey,
    nodeDefUuids: nodeDefUuidsToShow,
    lang,
  }).map((name) => `- ${StringUtils.truncateWithEllipsis(name, 40)}`);

  return [
    ...attributeNames,
    ...(overflow > 0 ? [i18n.t("common:andMore", { count: overflow })] : []),
  ];
};

export const confirmClearNewlyInapplicableValues = async ({
  dispatch,
  survey,
  lang,
  clearedDefUuids,
}: {
  dispatch: AppDispatch;
  survey: Survey;
  lang: LanguageCode;
  clearedDefUuids: Set<string>;
}): Promise<boolean> => {
  const attributeNamesToShow = findNewlyInapplicableNodeDefNames({
    survey,
    lang,
    clearedDefUuids,
  });
  if (attributeNamesToShow.length === 0) {
    return true;
  }
  return !!(await ConfirmUtils.confirm({
    dispatch,
    titleKey: "dataEntry:confirmUpdateNodesBecameNotApplicable.title",
    messageIsMarkdown: true,
    messageKey: "dataEntry:confirmUpdateNodesBecameNotApplicable.message",
    messageParams: { attributeNames: attributeNamesToShow.join("\n") },
    swipeToConfirm: true,
  }));
};
