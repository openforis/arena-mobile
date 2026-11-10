import { Keyboard } from "react-native";

import {
  Dates,
  NodeDefs,
  RecordFactory,
  Records,
  RecordUpdater,
  Surveys,
} from "@openforis/arena-core";

import { RecordLoadStatus, RecordOrigin, UserGroupQualifiers } from "model";
import { PreferencesService } from "service/preferencesService";
import { RecordService } from "service/recordService";

import { log, SystemUtils } from "utils";

import { AutoSyncActions } from "../autoSync";
import { ConfirmActions, ConfirmUtils } from "../confirm";
import { DeviceInfoActions } from "../deviceInfo";
import { MessageActions } from "../message";
import { PositionTrackingActions } from "../positionTracking/actions";
import { SurveySelectors } from "../survey";

import { startCsvDataExportJob } from "./actionsCsvDataExport";
import { exportRecords } from "./actionsDataExport";
import { runAutoSync } from "./actionsAutoSync";
import { DataEntryActionsRecordPreviousCycle } from "./actionsRecordPreviousCycle";
import { cloneRecordsIntoDefaultCycle } from "./actionsRecordsClone";
import {
  importRecordsFromFile,
  fetchRecordsFromServer,
} from "./actionsRecordsImport";
import { revalidateRecords } from "./actionsRecordsRevalidate";
import { ensureUserGroupReady } from "./actionsUserGroup";
import { DataEntryActionsRecordSync } from "./actionsRecordSync";
import { DataEntryActionsPreview } from "./actionsPreview";
import { DataEntryActionTypes } from "./actionTypes";
import { DataEntrySelectors } from "./selectors";
import { serializeRecordUpdate } from "./recordUpdateQueue";
import { selectRecordUpdaterParams } from "./recordUpdaterParams";
import { ToastActions } from "state/toast";
import type { AppDispatch, AppGetState } from "../store";
import {
  addNewAttribute,
  updateAttribute,
  updateCoordinateValueFromLatLong,
  updateCoordinateValueSrs,
} from "./actionsAttributeUpdate";
import {
  navigateToRecordsList,
  selectCurrentPageEntity,
  selectCurrentPageEntityActiveChildIndex,
  toggleRecordEditLock,
  toggleRecordPageMenuOpen,
} from "./actionsPageNavigation";
import {
  confirmClearNewlyInapplicableValues,
  handleError,
  isRecordSyncInProgress,
  prepareRecordForStorage,
  removeNodesFlags,
  updateRecord,
} from "./recordUpdateHelpers";

const { RECORD_SET } = DataEntryActionTypes;

const { linkToRecordInPreviousCycle, unlinkFromRecordInPreviousCycle } =
  DataEntryActionsRecordPreviousCycle;

const createNewRecord =
  ({ navigator }: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    try {
      let state = getState();
      const survey = SurveySelectors.selectCurrentSurvey(state)!;

      if (
        !(await ensureUserGroupReady({
          dispatch,
          getState,
          survey,
        }))
      ) {
        return;
      }
      state = getState();

      const updaterParams = selectRecordUpdaterParams(state);
      const { user } = updaterParams;
      const userGroup = SurveySelectors.selectCurrentSurveyUserGroup(state);
      const cycle = Surveys.getDefaultCycleKey(survey);
      // to always use the selected cycle, use this: const cycle = SurveySelectors.selectCurrentSurveyCycle(state);
      const appInfo = SystemUtils.getRecordAppInfo();
      const now = Dates.nowFormattedForStorage();
      const recordEmpty = {
        ...RecordFactory.createInstance({
          surveyUuid: survey.uuid,
          cycle,
          user,
          appInfo,
        }),
        dateCreated: now,
        dateModified: now,
      };
      let { record, nodes } = await RecordUpdater.createRootEntity({
        ...updaterParams,
        record: recordEmpty,
      });

      ({ record, nodes } = await UserGroupQualifiers.assignQualifierValues({
        ...updaterParams,
        userGroup,
        record,
        nodes,
      }));

      record.surveyId = survey.id;
      removeNodesFlags(nodes);

      record = prepareRecordForStorage({ record });

      record = await RecordService.insertRecord({ survey, record });
      dispatch(AutoSyncActions.markPending());

      await dispatch(editRecord({ navigator, record, locked: false }));
      await dispatch(PositionTrackingActions.autoStartTracking());
    } catch (error: any) {
      handleError(dispatch, error, "dataEntry:createRecordError");
    }
  };

const _performAddEntity = serializeRecordUpdate(async (dispatch, getState) => {
  if (isRecordSyncInProgress(dispatch, getState)) return;
  const state = getState();
  const updaterParams = selectRecordUpdaterParams(state);
  const { survey } = updaterParams;
  const record = DataEntrySelectors.selectRecord(state);
  const { parentEntityUuid: currentParentNodeUuid, entityDef: nodeDef } =
    DataEntrySelectors.selectCurrentPageEntity(state);

  const parentNode = (
    currentParentNodeUuid
      ? Records.getNodeByUuid(currentParentNodeUuid)(record)
      : Records.getRoot(record)
  )!;

  if (
    DataEntrySelectors.selectIsMaxCountReached({
      parentNodeUuid: parentNode.uuid,
      nodeDef,
    })(state)
  ) {
    dispatch(
      MessageActions.setWarning(
        "dataEntry:node.cannotAddMoreItems.maxCountReached",
      ),
    );
    return;
  }

  const {
    record: recordUpdated,
    nodes: nodesCreated,
    clearedDefUuids,
  } = await RecordUpdater.createNodeAndDescendants({
    ...updaterParams,
    record,
    parentNode,
    nodeDef,
    clearNonApplicableValues: !Surveys.isKeepNonApplicableValues(survey),
  });

  const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
  if (
    !(await confirmClearNewlyInapplicableValues({
      dispatch,
      survey,
      lang,
      clearedDefUuids,
    }))
  ) {
    log.debug(
      `Newly inapplicable values not confirmed. Reverting entity creation.`,
    );
    return;
  }

  removeNodesFlags(nodesCreated);

  const nodeCreated = Object.values(nodesCreated).find(
    (nodeCreated) => nodeCreated.nodeDefUuid === nodeDef.uuid,
  )!;

  await updateRecord({ dispatch, survey, record: recordUpdated });

  dispatch(
    selectCurrentPageEntity({
      parentEntityUuid: parentNode.uuid,
      entityDefUuid: nodeDef.uuid,
      entityUuid: nodeCreated.uuid,
    }),
  );
});

const addNewEntity =
  (options = {} as any) =>
  (dispatch: AppDispatch) => {
    const { delay = null } = options;
    Keyboard.dismiss();
    if (delay) {
      setTimeout(() => dispatch(_performAddEntity), delay);
    } else {
      dispatch(_performAddEntity);
    }
  };

const deleteNodes = (nodeUuids: any) =>
  serializeRecordUpdate(async (dispatch, getState) => {
    if (isRecordSyncInProgress(dispatch, getState)) return;
    const state = getState();
    const updaterParams = selectRecordUpdaterParams(state);
    const { survey } = updaterParams;
    const record = DataEntrySelectors.selectRecord(state);
    const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);

    const {
      record: recordUpdated,
      nodes,
      clearedDefUuids,
    } = await RecordUpdater.deleteNodes({
      ...updaterParams,
      record,
      nodeUuids,
      clearNonApplicableValues: !Surveys.isKeepNonApplicableValues(survey),
    });

    if (
      !(await confirmClearNewlyInapplicableValues({
        dispatch,
        survey,
        lang,
        clearedDefUuids,
      }))
    ) {
      log.debug(`Newly inapplicable values not confirmed. Reverting deletion.`);
      return;
    }

    removeNodesFlags(nodes);

    await updateRecord({ dispatch, survey, record: recordUpdated });
  });

const deleteRecords =
  (recordUuids: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;

    await RecordService.deleteRecords({ surveyId: survey.id, recordUuids });
    await dispatch(PositionTrackingActions.deleteTracksOfRecords(recordUuids));

    dispatch(DeviceInfoActions.updateFreeDiskStorage());
  };

const checkEntityPageIsValidAndNotRoot = ({
  survey,
  entityPage,
  record,
}: any) => {
  const { parentEntityUuid, entityDefUuid, entityUuid } = entityPage;
  const entityDef = Surveys.findNodeDefByUuid({ survey, uuid: entityDefUuid });
  return (
    entityDef &&
    !NodeDefs.isRoot(entityDef) &&
    (parentEntityUuid === null ||
      !!Records.getNodeByUuid(parentEntityUuid)(record)) &&
    (entityUuid === null || !!Records.getNodeByUuid(entityUuid)(record))
  );
};

const editRecord =
  ({ navigator, record, locked = true }: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const surveyId = SurveySelectors.selectCurrentSurveyId(state);
    const { id: recordId } = record;
    const lastEditedPage =
      await PreferencesService.getSurveyRecordLastEditedPage(
        surveyId,
        recordId,
      );
    const resumeLastEditedPage =
      lastEditedPage &&
      checkEntityPageIsValidAndNotRoot({
        survey,
        entityPage: lastEditedPage,
        record,
      }) &&
      (await ConfirmUtils.confirm({
        dispatch,
        confirmButtonTextKey: "common:continue",
        cancelButtonTextKey: "common:no",
        messageKey: "recordsList:continueEditing.confirm.message",
        titleKey: "recordsList:continueEditing.title",
      }));

    await dispatch({
      type: RECORD_SET,
      record,
      recordEditLockAvailable: locked,
      recordEditLocked:
        locked && (!resumeLastEditedPage || lastEditedPage.locked),
      recordPageSelectorMenuOpen: false,
    });

    navigator.navigateToRecordEditor();

    if (resumeLastEditedPage) {
      await dispatch(selectCurrentPageEntity(lastEditedPage));
    }
    await dispatch(PositionTrackingActions.recoverTrackForOpenRecord());
  };

const _fetchAndEditRecordInternal = async ({
  dispatch,
  navigator,
  survey,
  recordId,
}: any) => {
  const record = await RecordService.fetchRecord({ survey, recordId });
  await dispatch(editRecord({ navigator, record }));
};

const fetchAndEditRecord =
  ({ navigator, recordSummary }: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const {
      id: recordId,
      uuid: recordUuid,
      origin,
      loadStatus,
    } = recordSummary;
    if (DataEntryActionsRecordSync.isRecordBeingReplaced(recordUuid)) {
      // auto-sync is replacing it with the version merged on the server: opening it now, the
      // editor would start from content about to be replaced
      dispatch(ToastActions.show("dataEntry:autoSync.recordSyncInProgress"));
      return;
    }
    if (
      origin === RecordOrigin.remote &&
      loadStatus !== RecordLoadStatus.complete
    ) {
      dispatch(
        ConfirmActions.show({
          confirmButtonTextKey: "recordsList:fetchRecord",
          messageKey: "recordsList:confirmFetchRecordFromServer",
          onConfirm: () => {
            dispatch(
              fetchRecordsFromServer({
                recordUuids: [recordUuid],
                onImportComplete: async () => {
                  await _fetchAndEditRecordInternal({
                    dispatch,
                    navigator,
                    survey,
                    recordId,
                  });
                },
              }),
            );
          },
        }),
      );
    } else {
      await _fetchAndEditRecordInternal({
        dispatch,
        navigator,
        survey,
        recordId,
      });
    }
  };

export const DataEntryActions = {
  createNewRecord,
  addNewEntity,
  addNewAttribute,
  deleteNodes,
  deleteRecords,
  fetchAndEditRecord,
  updateAttribute,
  updateCoordinateValueFromLatLong,
  updateCoordinateValueSrs,
  selectCurrentPageEntity,
  selectCurrentPageEntityActiveChildIndex,
  toggleRecordPageMenuOpen,
  toggleRecordEditLock,

  navigateToRecordsList,

  exportRecords,
  startCsvDataExportJob,

  linkToRecordInPreviousCycle,
  unlinkFromRecordInPreviousCycle,

  importRecordsFromFile,
  fetchRecordsFromServer,
  cloneRecordsIntoDefaultCycle,
  revalidateRecords,
  runAutoSync,
  ...DataEntryActionsPreview,
};
