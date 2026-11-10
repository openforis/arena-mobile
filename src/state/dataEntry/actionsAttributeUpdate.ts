import {
  NodeDefs,
  NodeDefType,
  Numbers,
  Objects,
  PointFactory,
  Points,
  Records,
  RecordUpdater,
  Surveys,
} from "@openforis/arena-core";

import { RecordUtils, SurveyDefs } from "model";
import { RecordFileService } from "service/recordFileService";
import { RecordService } from "service/recordService";

import { log } from "utils";
import { PreviewMode } from "utils/PreviewMode";

import { ConfirmActions, ConfirmUtils } from "../confirm";
import { DeviceInfoActions } from "../deviceInfo";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";

import { DataEntryActionsRecordPreviousCycle } from "./actionsRecordPreviousCycle";
import { DataEntrySelectors } from "./selectors";
import { serializeRecordUpdate } from "./recordUpdateQueue";
import { selectRecordUpdaterParams } from "./recordUpdaterParams";
import type { AppDispatch, AppGetState } from "../store";
import {
  confirmClearNewlyInapplicableValues,
  handleError,
  isRecordSyncInProgress,
  removeNodesFlags,
  updateRecord,
} from "./recordUpdateHelpers";

const { unlinkFromRecordInPreviousCycle, updatePreviousCyclePageEntity } =
  DataEntryActionsRecordPreviousCycle;

const _isRootKeyDuplicate = async ({ survey, record, lang }: any) => {
  // no other records in preview mode
  if (PreviewMode.isActive) return false;
  const recordSummaries = await RecordService.findRecordSummariesWithSameKeys({
    survey,
    record,
    lang,
  });
  return (
    recordSummaries.length > 1 ||
    (recordSummaries.length === 1 && recordSummaries[0]!.uuid !== record.uuid)
  );
};

const saveRecordNodeFile = async ({ survey, fileUri, value }: any) => {
  if (!fileUri) return;
  log.debug(
    `Saving record node file with value ${JSON.stringify(value)} and fileUri ${fileUri}`,
  );
  await RecordFileService.saveRecordFile({
    surveyId: survey.id,
    fileUuid: value?.fileUuid,
    sourceFileUri: fileUri,
  });
};

// to be called once the record is stored: until then it still references the previous file
const deletePreviousRecordNodeFile = async ({
  survey,
  value,
  node,
  dispatch,
}: any) => {
  const fileUuidPrev = node.value?.fileUuid;
  if (fileUuidPrev && fileUuidPrev !== value?.fileUuid) {
    log.debug(`Deleting previous file with uuid ${fileUuidPrev}`);
    try {
      await RecordFileService.deleteRecordFile({
        surveyId: survey.id,
        fileUuid: fileUuidPrev,
      });
    } catch (error) {
      // the value is already stored: an unused file left behind must not look like a failed update
      log.warn(`error deleting file ${fileUuidPrev}: ${error}`);
    }
  }
  // files kept in memory in preview mode
  if (!PreviewMode.isActive) {
    dispatch(DeviceInfoActions.updateFreeDiskStorage());
  }
};

const checkAndConfirmUpdateNode = async ({
  dispatch,
  getState,
  node,
  nodeDef,
}: any) => {
  const state = getState();
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
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

const _onAttributeUpdated = async ({
  dispatch,
  state,
  survey,
  record,
  nodeDef,
  lang,
}: any) => {
  const cycle = Records.getCycle(record);
  const isRootKeyDef = SurveyDefs.isRootKeyDef({ survey, cycle, nodeDef });
  if (
    DataEntrySelectors.selectIsLinkedToPreviousCycleRecord(state) &&
    NodeDefs.isKey(nodeDef)
  ) {
    if (isRootKeyDef) {
      dispatch(unlinkFromRecordInPreviousCycle());
    } else {
      // key of a nested entity changed: refresh the matching previous-cycle entity
      dispatch(updatePreviousCyclePageEntity);
    }
  }

  if (isRootKeyDef && (await _isRootKeyDuplicate({ survey, record, lang }))) {
    const keyValues = RecordUtils.getRootEntityKeysFormatted({
      survey,
      record,
      lang,
    }).join(", ");

    dispatch(
      MessageActions.setMessage({
        content: "recordsList:duplicateKey.message",
        contentParams: { keyValues },
        title: "recordsList:duplicateKey.title",
      }),
    );
  }
};

export const updateAttribute = ({
  uuid,
  value,
  fileUri = null,
}: {
  uuid: string;
  value: any;
  fileUri?: string | null;
}) =>
  serializeRecordUpdate(async (dispatch, getState) => {
    try {
      const state = getState();
      const record = DataEntrySelectors.selectRecord(state);
      const node = Records.getNodeByUuid(uuid)(record);
      if (!node) return;

      const updaterParams = selectRecordUpdaterParams(state);
      const { survey } = updaterParams;
      const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);

      // nothing actually changed (e.g. a field was focused and left as is): don't touch the
      // record, otherwise it would look modified and the auto-sync status would turn pending
      if (!fileUri && Objects.isEqual(node.value ?? null, value ?? null)) {
        return;
      }
      if (isRecordSyncInProgress(dispatch, getState)) return;

      const nodeDef = Surveys.getNodeDefByUuid({
        survey,
        uuid: node.nodeDefUuid,
      });

      if (
        !(await checkAndConfirmUpdateNode({
          dispatch,
          getState,
          node,
          nodeDef,
        }))
      )
        return;

      const {
        record: recordUpdated,
        nodes: nodesUpdated,
        clearedDefUuids,
      } = await RecordUpdater.updateAttributeValue({
        ...updaterParams,
        record,
        attributeUuid: uuid,
        value,
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
        log.debug(`Newly inapplicable values not confirmed. Reverting update.`);
        return;
      }

      removeNodesFlags(nodesUpdated);

      const isFileDef = NodeDefs.getType(nodeDef) === NodeDefType.file;
      if (isFileDef) {
        await saveRecordNodeFile({ survey, fileUri, value });
      }

      // a sync started meanwhile would be overwritten
      if (isRecordSyncInProgress(dispatch, getState)) return;

      await updateRecord({ dispatch, survey, record: recordUpdated });
      if (isFileDef) {
        await deletePreviousRecordNodeFile({ survey, value, node, dispatch });
      }
      await _onAttributeUpdated({
        dispatch,
        state,
        survey,
        record: recordUpdated,
        nodeDef,
        lang,
      });
      log.debug(`Node updated successfully.`);
    } catch (error) {
      handleError(dispatch, error, "dataEntry:updateAttributeError");
    }
  });

const performCoordinateValueSrsConversion =
  ({ nodeUuid, srsTo }: any) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = DataEntrySelectors.selectRecord(state);
    const srsIndex = Surveys.getSRSIndex(survey);

    const node = Records.getNodeByUuid(nodeUuid)(record);
    const prevValue = node?.value ?? {};
    const { x, y, srs } = prevValue;
    const pointFrom = PointFactory.createInstance({ x, y, srs })!;
    const pointTo = Points.transform(pointFrom, srsTo, srsIndex)!;
    const nextValue = {
      ...prevValue,
      x: Numbers.roundToPrecision(pointTo.x, 6),
      y: Numbers.roundToPrecision(pointTo.y, 6),
      srs: srsTo,
    };
    dispatch(updateAttribute({ uuid: nodeUuid, value: nextValue }));
  };

export const updateCoordinateValueFromLatLong =
  ({ nodeUuid, latitude, longitude }: any) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = DataEntrySelectors.selectRecord(state);
    const srsIndex = Surveys.getSRSIndex(survey);

    const node = Records.getNodeByUuid(nodeUuid)(record);
    const prevValue = node?.value ?? {};
    const srsTo = prevValue.srs ?? Surveys.getSRSs(survey)[0]!.code;
    const pointLatLong = PointFactory.createInstance({
      x: longitude,
      y: latitude,
    })!;
    const pointTo = Points.transform(pointLatLong, srsTo, srsIndex);
    if (!pointTo) return;
    const nextValue = {
      ...prevValue,
      x: Numbers.roundToPrecision(pointTo.x, 6),
      y: Numbers.roundToPrecision(pointTo.y, 6),
      srs: srsTo,
    };
    dispatch(updateAttribute({ uuid: nodeUuid, value: nextValue }));
  };

export const updateCoordinateValueSrs =
  ({ nodeUuid, srsTo }: any) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
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
        }),
      );
    }
  };

export const addNewAttribute = ({
  nodeDef,
  parentNodeUuid,
  value = null,
}: any) =>
  serializeRecordUpdate(async (dispatch, getState) => {
    if (isRecordSyncInProgress(dispatch, getState)) return;
    const state = getState();
    const updaterParams = selectRecordUpdaterParams(state);
    const { survey } = updaterParams;
    const record = DataEntrySelectors.selectRecord(state);
    const parentNode = Records.getNodeByUuid(parentNodeUuid)(record);

    const { record: recordUpdated, nodes: nodesCreated } =
      await RecordUpdater.createNodeAndDescendants({
        ...updaterParams,
        record,
        parentNode,
        nodeDef,
      });

    const nodeCreated = Object.values(nodesCreated).find(
      (nodeCreated) => nodeCreated.nodeDefUuid === nodeDef.uuid,
    )!;

    const { record: recordUpdated2 } = await RecordUpdater.updateAttributeValue(
      {
        ...updaterParams,
        record: recordUpdated,
        attributeUuid: nodeCreated.uuid,
        value,
      },
    );

    await updateRecord({ dispatch, survey, record: recordUpdated2 });
  });
