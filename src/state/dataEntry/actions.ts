import { Keyboard } from "react-native";

import {
  Dates,
  NodeDefs,
  NodeDefType,
  Numbers,
  Objects,
  PointFactory,
  Points,
  RecordFactory,
  Records,
  RecordUpdater,
  Surveys,
  Validations,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordOrigin, RecordLoadStatus, SurveyDefs, RecordNodes } from "model";
// @ts-expect-error TS(2307): Cannot find module 'service/preferencesService' or... Remove this comment to see the full error message
import { PreferencesService } from "service/preferencesService";
// @ts-expect-error TS(2307): Cannot find module 'service/recordService' or its ... Remove this comment to see the full error message
import { RecordService } from "service/recordService";
// @ts-expect-error TS(2307): Cannot find module 'service/recordFileService' or ... Remove this comment to see the full error message
import { RecordFileService } from "service/recordFileService";

// @ts-expect-error TS(2307): Cannot find module 'screens/screenKeys' or its cor... Remove this comment to see the full error message
import { screenKeys } from "screens/screenKeys";

// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { SystemUtils } from "utils";

import { ConfirmActions, ConfirmUtils } from "../confirm";
import { DeviceInfoActions, DeviceInfoSelectors } from "../deviceInfo";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";

import { RemoteConnectionSelectors } from "../remoteConnection";
import { DataEntryActionTypes } from "./actionTypes";
import { DataEntrySelectors } from "./selectors";
import { exportRecords } from "./actionsDataExport";
import { DataEntryActionsRecordPreviousCycle } from "./actionsRecordPreviousCycle";
import {
  importRecordsFromFile,
  importRecordsFromServer,
} from "./actionsRecordsImport";
import { cloneRecordsIntoDefaultCycle } from "./actionsRecordsClone";

const {
  DATA_ENTRY_RESET,
  PAGE_ENTITY_ACTIVE_CHILD_INDEX_SET,
  PAGE_ENTITY_SET,
  PAGE_SELECTOR_MENU_OPEN_SET,
  RECORD_EDIT_LOCKED,
  RECORD_SET,
} = DataEntryActionTypes;

const {
  linkToRecordInPreviousCycle,
  unlinkFromRecordInPreviousCycle,
  updatePreviousCyclePageEntity,
} = DataEntryActionsRecordPreviousCycle;

const removeNodesFlags = (nodes: any) => {
  Object.values(nodes).forEach((node) => {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    delete node["created"];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    delete node["deleted"];
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    delete node["updated"];
  });
};

const _isRootKeyDuplicate = async ({
  survey,
  record,
  lang
}: any) => {
  const recordSummaries = await RecordService.findRecordSummariesWithSameKeys({
    survey,
    record,
    lang,
  });
  return (
    recordSummaries.length > 1 ||
    (recordSummaries.length === 1 && recordSummaries[0].uuid !== record.uuid)
  );
};

const prepareRecordForStorage = ({
  record
}: any) => {
  const validation = Validations.getValidation(record);
  const validationUpdated = Validations.updateCounts(validation);
  return { ...record, validation: validationUpdated };
};

const createNewRecord =
  ({
    navigation
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const cycle = Surveys.getDefaultCycleKey(survey);
    // to always use the selected cycle, use this: const cycle = SurveySelectors.selectCurrentSurveyCycle(state);
    const appInfo = SystemUtils.getRecordAppInfo();
    const now = Dates.nowFormattedForStorage();
    const recordEmpty = {
      ...RecordFactory.createInstance({
        surveyUuid: survey.uuid,
        cycle,
        user: user ?? {},
        appInfo,
      }),
      dateCreated: now,
      dateModified: now,
    };
    let { record, nodes } = await RecordUpdater.createRootEntity({
      user,
      survey,
      record: recordEmpty,
    });

    record.surveyId = survey.id;
    removeNodesFlags(nodes);

    record = prepareRecordForStorage({ record });

    record = await RecordService.insertRecord({ survey, record });

    dispatch(editRecord({ navigation, record, locked: false }));
  };

const _performAddEntity = async (dispatch: any, getState: any) => {
  const state = getState();
  const user = RemoteConnectionSelectors.selectLoggedUser(state);
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const record = DataEntrySelectors.selectRecord(state);
  const { parentEntityUuid: currentParentNodeUuid, entityDef: nodeDef } =
    DataEntrySelectors.selectCurrentPageEntity(state);

  const parentNode = currentParentNodeUuid
    ? Records.getNodeByUuid(currentParentNodeUuid)(record)
    : Records.getRoot(record);

  if (
    DataEntrySelectors.selectIsMaxCountReached({
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      parentNodeUuid: parentNode.uuid,
      nodeDef,
    })(state)
  ) {
    dispatch(
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      MessageActions.setWarning(
        "dataEntry:node.cannotAddMoreItems.maxCountReached"
      )
    );
    return;
  }

  const { record: recordUpdated, nodes: nodesCreated } =
    await RecordUpdater.createNodeAndDescendants({
      user,
      survey,
      record,
      parentNode,
      nodeDef,
    });

  removeNodesFlags(nodesCreated);

  const nodeCreated = Object.values(nodesCreated).find(
    (nodeCreated) => nodeCreated.nodeDefUuid === nodeDef.uuid
  );

  await _updateRecord({ dispatch, survey, record: recordUpdated });

  dispatch(
    selectCurrentPageEntity({
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      parentEntityUuid: parentNode.uuid,
      entityDefUuid: nodeDef.uuid,
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      entityUuid: nodeCreated.uuid,
    })
  );
};

const addNewEntity =
  (options = {}) =>
  async (dispatch: any) => {
    // @ts-expect-error TS(2339): Property 'delay' does not exist on type '{}'.
    const { delay = null } = options;
    Keyboard.dismiss();
    if (delay) {
      setTimeout(() => dispatch(_performAddEntity), delay);
    } else {
      dispatch(_performAddEntity);
    }
  };

const deleteNodes = (nodeUuids: any) => async (dispatch: any, getState: any) => {
  const state = getState();
  const user = RemoteConnectionSelectors.selectLoggedUser(state);
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const record = DataEntrySelectors.selectRecord(state);

  const { record: recordUpdated, nodes } = await RecordUpdater.deleteNodes({
    user,
    survey,
    record,
    nodeUuids,
  });

  removeNodesFlags(nodes);

  await _updateRecord({ dispatch, survey, record: recordUpdated });
};

const deleteRecords = (recordUuids: any) => async (dispatch: any, getState: any) => {
  const state = getState();
  const survey = SurveySelectors.selectCurrentSurvey(state);

  await RecordService.deleteRecords({ surveyId: survey.id, recordUuids });

  dispatch(DeviceInfoActions.updateFreeDiskStorage());
};

const checkEntityPageIsValidAndNotRoot = ({
  survey,
  entityPage,
  record
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
  ({
    navigation,
    record,
    locked = true
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const surveyId = SurveySelectors.selectCurrentSurveyId(state);
    const { id: recordId } = record;
    const lastEditedPage =
      await PreferencesService.getSurveyRecordLastEditedPage(
        surveyId,
        recordId
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

    navigation.navigate(screenKeys.recordEditor);

    if (resumeLastEditedPage) {
      await dispatch(selectCurrentPageEntity(lastEditedPage));
    }
  };

const _fetchAndEditRecordInternal = async ({
  dispatch,
  navigation,
  survey,
  recordId
}: any) => {
  const record = await RecordService.fetchRecord({ survey, recordId });
  await dispatch(editRecord({ navigation, record }));
};

const fetchAndEditRecord =
  ({
    navigation,
    recordSummary
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const {
      id: recordId,
      uuid: recordUuid,
      origin,
      loadStatus,
    } = recordSummary;
    if (
      origin === RecordOrigin.remote &&
      loadStatus !== RecordLoadStatus.complete
    ) {
      dispatch(
        ConfirmActions.show({
          confirmButtonTextKey: "recordsList:importRecord",
          messageKey: "recordsList:confirmImportRecordFromServer",
          onConfirm: () => {
            dispatch(
              importRecordsFromServer({
                recordUuids: [recordUuid],
                onImportComplete: async () => {
                  await _fetchAndEditRecordInternal({
                    dispatch,
                    navigation,
                    survey,
                    recordId,
                  });
                },
              })
            );
          },
        })
      );
    } else {
      await _fetchAndEditRecordInternal({
        dispatch,
        navigation,
        survey,
        recordId,
      });
    }
  };

const _updateRecord = async ({
  dispatch,
  survey,
  record
}: any) => {
  const recordUpdated = prepareRecordForStorage({ record });
  const recordStored = await RecordService.updateRecord({
    survey,
    record: recordUpdated,
  });
  await dispatch({ type: RECORD_SET, record: recordStored });
  return recordStored;
};

const updateRecordNodeFile = async ({
  survey,
  fileUri,
  value,
  node,
  dispatch
}: any) => {
  const surveyId = survey.id;

  if (fileUri) {
    const { fileUuid: fileUuidNext } = value || {};

    await RecordFileService.saveRecordFile({
      surveyId,
      fileUuid: fileUuidNext,
      sourceFileUri: fileUri,
    });
  }

  const { value: valuePrev } = node;
  const { fileUuid: fileUuidPrev } = valuePrev || {};
  if (fileUuidPrev) {
    await RecordFileService.deleteRecordFile({
      surveyId,
      fileUuid: fileUuidPrev,
    });
  }
  dispatch(DeviceInfoActions.updateFreeDiskStorage());
};

const checkAndConfirmUpdateNode = async ({
  dispatch,
  getState,
  node,
  nodeDef
}: any) => {
  const state = getState();
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
  const record = DataEntrySelectors.selectRecord(state);
  const dependentEnumeratedEntityDefs =
    Records.findDependentEnumeratedEntityDefsNotEmpty({
      survey,
      node,
      nodeDef,
    })(record);
  const dependentEnumeratedEntityDefsLabel = dependentEnumeratedEntityDefs
    ?.map((def) => NodeDefs.getLabelOrName(def, lang))
    .join(", ");
  if (dependentEnumeratedEntityDefsLabel) {
    return await ConfirmUtils.confirm({
      dispatch,
      titleKey: "dataEntry:confirmUpdateDependentEnumeratedEntities.title",
      messageKey: "dataEntry:confirmUpdateDependentEnumeratedEntities.message",
      messageParams: { entityDefs: dependentEnumeratedEntityDefsLabel },
    });
  }
  return true;
};

const updateAttribute =
  ({
    uuid,
    value,
    fileUri = null
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
    const record = DataEntrySelectors.selectRecord(state);

    const cycle = Records.getCycle(record);
    const node = Records.getNodeByUuid(uuid)(record);
    const nodeDef = Surveys.getNodeDefByUuid({
      survey,
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      uuid: node.nodeDefUuid,
    });

    if (
      !(await checkAndConfirmUpdateNode({ dispatch, getState, node, nodeDef }))
    )
      return;

    let { record: recordUpdated, nodes: nodesUpdated } =
      await RecordUpdater.updateAttributeValue({
        user,
        survey,
        record,
        attributeUuid: uuid,
        value,
      });

    removeNodesFlags(nodesUpdated);

    if (NodeDefs.getType(nodeDef) === NodeDefType.file) {
      await updateRecordNodeFile({ survey, node, fileUri, value, dispatch });
    }

    const isRootKeyDef = SurveyDefs.isRootKeyDef({ survey, cycle, nodeDef });

    await _updateRecord({ dispatch, survey, record: recordUpdated });
    if (
      DataEntrySelectors.selectIsLinkedToPreviousCycleRecord(state) &&
      isRootKeyDef
    ) {
      dispatch(unlinkFromRecordInPreviousCycle());
    }

    if (
      isRootKeyDef &&
      (await _isRootKeyDuplicate({ survey, record: recordUpdated, lang }))
    ) {
      const keyValues = RecordNodes.getRootEntityKeysFormatted({
        survey,
        record: recordUpdated,
        lang,
      }).join(", ");

      dispatch(
        MessageActions.setMessage({
          content: "recordsList:duplicateKey.message",
          contentParams: { keyValues },
          title: "recordsList:duplicateKey.title",
        })
      );
    }
  };

const performCoordinateValueSrsConversion =
  ({
    nodeUuid,
    srsTo
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const record = DataEntrySelectors.selectRecord(state);
    const srsIndex = Surveys.getSRSIndex(survey);

    const node = Records.getNodeByUuid(nodeUuid)(record);
    const prevValue = node?.value ?? {};
    const { x, y, srs } = prevValue;
    const pointFrom = PointFactory.createInstance({ x, y, srs });
    const pointTo = Points.transform(pointFrom, srsTo, srsIndex);
    const nextValue = {
      ...prevValue,
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      x: Numbers.roundToPrecision(pointTo.x, 6),
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      y: Numbers.roundToPrecision(pointTo.y, 6),
      srs: srsTo,
    };
    dispatch(updateAttribute({ uuid: nodeUuid, value: nextValue }));
  };

const updateCoordinateValueSrs =
  ({
    nodeUuid,
    srsTo
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const record = DataEntrySelectors.selectRecord(state);

    const node = Records.getNodeByUuid(nodeUuid)(record);
    const prevValue = node?.value ?? {};
    const { x, y, srs } = prevValue;

    if (srsTo === srs) return;

    const nextValue = {
      ...prevValue,
      x: Objects.isEmpty(x) ? 0 : x,
      y: Objects.isEmpty(y) ? 0 : y,
      srs: srsTo,
    };
    if (Objects.isEmpty(x) || Objects.isEmpty(y)) {
      dispatch(updateAttribute({ uuid: nodeUuid, value: nextValue }));
    } else {
      dispatch(
        ConfirmActions.show({
          messageKey: "dataEntry:coordinate.confirmConvertCoordinate",
          messageParams: { srsFrom: srs, srsTo },
          confirmButtonTextKey: "dataEntry:coordinate.convert",
          cancelButtonTextKey: "dataEntry:coordinate.keepXAndY",
          onConfirm: () =>
            dispatch(performCoordinateValueSrsConversion({ nodeUuid, srsTo })),
          onCancel: () =>
            dispatch(updateAttribute({ uuid: nodeUuid, value: nextValue })),
        })
      );
    }
  };

const addNewAttribute =
  ({
    nodeDef,
    parentNodeUuid,
    value = null
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const record = DataEntrySelectors.selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record);

    const { record: recordUpdated, nodes: nodesCreated } =
      await RecordUpdater.createNodeAndDescendants({
        user,
        survey,
        record,
        parentNode,
        nodeDef,
      });

    const nodeCreated = Object.values(nodesCreated).find(
      (nodeCreated) => nodeCreated.nodeDefUuid === nodeDef.uuid
    );

    const { record: recordUpdated2 } = await RecordUpdater.updateAttributeValue(
      {
        user,
        survey,
        record: recordUpdated,
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        attributeUuid: nodeCreated.uuid,
        value,
      }
    );

    await _updateRecord({ dispatch, survey, record: recordUpdated2 });
  };

const selectCurrentPageEntity =
  ({
    parentEntityUuid,
    entityDefUuid,
    entityUuid = null
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const surveyId = SurveySelectors.selectCurrentSurveyId(state);
    const record = DataEntrySelectors.selectRecord(state);
    const { id: recordId } = record;
    const { entityDef: prevEntityDef, entityUuid: prevEntityUuid } =
      DataEntrySelectors.selectCurrentPageEntity(state);
    const isPhone = DeviceInfoSelectors.selectIsPhone(state);
    const locked = DataEntrySelectors.selectRecordEditLocked(state);

    const nextEntityUuid =
      entityDefUuid === prevEntityDef.uuid &&
      entityUuid === prevEntityUuid &&
      NodeDefs.isMultiple(prevEntityDef)
        ? null // set pointer to list of entities
        : entityUuid;

    if (!!nextEntityUuid && nextEntityUuid === prevEntityUuid) {
      // same entity selected (e.g. single entity from breadcrumb): do nothing
      return;
    }

    const payload = {
      parentEntityUuid,
      entityDefUuid,
      entityUuid: nextEntityUuid,
      locked,
    };

    dispatch({ type: PAGE_ENTITY_SET, payload });

    if (DataEntrySelectors.selectIsLinkedToPreviousCycleRecord(state)) {
      dispatch(updatePreviousCyclePageEntity);
    }

    if (isPhone) {
      dispatch(closeRecordPageMenu);
    }
    await PreferencesService.setSurveyRecordLastEditedPage(
      surveyId,
      recordId,
      payload
    );
  };

const selectCurrentPageEntityActiveChildIndex =
  (index: any) => (dispatch: any, getState: any) => {
    dispatch({ type: PAGE_ENTITY_ACTIVE_CHILD_INDEX_SET, index });
    const state = getState();
    const isPhone = DeviceInfoSelectors.selectIsPhone(state);
    if (isPhone) {
      dispatch(closeRecordPageMenu);
    }
  };

const toggleRecordPageMenuOpen = (dispatch: any, getState: any) => {
  Keyboard.dismiss();
  const state = getState();
  const open = DataEntrySelectors.selectRecordPageSelectorMenuOpen(state);
  dispatch({ type: PAGE_SELECTOR_MENU_OPEN_SET, open: !open });
};

const closeRecordPageMenu = (dispatch: any, getState: any) => {
  const state = getState();
  const pageSelectorMenuOpen =
    DataEntrySelectors.selectRecordPageSelectorMenuOpen(state);
  if (pageSelectorMenuOpen) {
    dispatch({ type: PAGE_SELECTOR_MENU_OPEN_SET, open: false });
  }
};

const toggleRecordEditLock = (dispatch: any, getState: any) => {
  Keyboard.dismiss();
  const state = getState();
  const locked = DataEntrySelectors.selectRecordEditLocked(state);
  dispatch({ type: RECORD_EDIT_LOCKED, locked: !locked });
};

const navigateToRecordsList =
  ({
    navigation
  }: any) =>
  (dispatch: any) => {
    dispatch(
      ConfirmActions.show({
        confirmButtonTextKey: "dataEntry:goToListOfRecords",
        messageKey: "dataEntry:confirmGoToListOfRecords",
        onConfirm: () => {
          // pop=true pops the current screen from the stack and avoids going back to it (unmounts the RecordEditor component)
          navigation.navigate({ name: screenKeys.recordsList, pop: true });
          dispatch({ type: DATA_ENTRY_RESET });
        },
      })
    );
  };

export const DataEntryActions = {
  createNewRecord,
  addNewEntity,
  addNewAttribute,
  deleteNodes,
  deleteRecords,
  fetchAndEditRecord,
  updateAttribute,
  updateCoordinateValueSrs,
  selectCurrentPageEntity,
  selectCurrentPageEntityActiveChildIndex,
  toggleRecordPageMenuOpen,
  toggleRecordEditLock,

  navigateToRecordsList,
  exportRecords,

  linkToRecordInPreviousCycle,
  unlinkFromRecordInPreviousCycle,

  importRecordsFromFile,
  importRecordsFromServer,
  cloneRecordsIntoDefaultCycle,
};
