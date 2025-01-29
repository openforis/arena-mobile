import { Objects } from "@openforis/arena-core";

import { Cycles, RecordLoadStatus, RecordNodes, RecordOrigin } from "model";
import { RecordService } from "service";
import { ToastActions } from "../toast";
import { ConfirmUtils } from "../confirm";
import { SurveySelectors } from "../survey";

import { DataEntrySelectors } from "./selectors";
import { DataEntryActionTypes } from "./actionTypes";
import { importRecordsFromServer } from "./actionsRecordsImport";

const {
  PREVIOUS_CYCLE_PAGE_ENTITY_SET,
  RECORD_PREVIOUS_CYCLE_LOAD,
  RECORD_PREVIOUS_CYCLE_SET,
  RECORD_PREVIOUS_CYCLE_RESET,
} = DataEntryActionTypes;

const _fetchRecordFromPreviousCycleAndLinkItInternal = async ({
  dispatch,
  survey,
  recordId,
}) => {
  dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: true });

  const recordSummary = await RecordService.fetchRecordSummary({
    survey,
    recordId,
  });
  const { loadStatus, origin } = recordSummary;
  const loaded =
    origin !== RecordOrigin.remote || loadStatus === RecordLoadStatus.complete;

  if (loaded) {
    const record = await RecordService.fetchRecord({ survey, recordId });
    await dispatch({ type: RECORD_PREVIOUS_CYCLE_SET, record });
    dispatch(ToastActions.show("dataEntry:recordInPreviousCycle.foundMessage"));
    dispatch(updatePreviousCyclePageEntity);
  }
  dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: false });
  return loaded;
};

const _fetchRecordFromPreviousCycleAndLinkIt = async ({
  dispatch,
  survey,
  record,
  prevCycle,
  lang,
}) => {
  dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: true });

  const prevCycleString = Cycles.labelFunction(prevCycle);

  const keyValuesString = RecordNodes.getRootEntityKeysFormatted({
    survey,
    record,
    lang,
  }).join(", ");

  const prevCycleRecordSummaries =
    await RecordService.findRecordSummariesWithSameKeys({
      survey,
      record,
      lang,
      cycle: prevCycle,
    });

  if (prevCycleRecordSummaries.length === 0) {
    dispatch(unlinkFromRecordInPreviousCycle());
    dispatch(
      ToastActions.show("dataEntry:recordInPreviousCycle.notFoundMessage", {
        cycle: prevCycleString,
        keyValues: keyValuesString,
      })
    );
  } else if (prevCycleRecordSummaries.length === 1) {
    const prevCycleRecordSummary = prevCycleRecordSummaries[0];
    const { id: prevCycleRecordId, uuid: prevCycleRecordUuid } =
      prevCycleRecordSummary;

    const doFetch = async () =>
      _fetchRecordFromPreviousCycleAndLinkItInternal({
        dispatch,
        survey,
        recordId: prevCycleRecordId,
      });
    if (!(await doFetch())) {
      if (
        await ConfirmUtils.confirm({
          dispatch,
          messageKey:
            "dataEntry:recordInPreviousCycle.confirmFetchRecordInCycle",
          messageParams: { cycle: prevCycleString, keyValues: keyValuesString },
        })
      ) {
        dispatch(
          importRecordsFromServer({
            recordUuids: [prevCycleRecordUuid],
            onImportComplete: doFetch,
          })
        );
      }
    }
  } else {
    dispatch(
      ToastActions.show(
        "dataEntry:recordInPreviousCycle.multipleRecordsFoundMessage",
        {
          cycle: prevCycleString,
          keyValues: keyValuesString,
        }
      )
    );
  }
  dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: false });

  return {
    keyValues: keyValuesString,
    prevCycleRecordIds: prevCycleRecordSummaries,
  };
};

const _askPreviousCycleKey = async ({ dispatch, getState }) => {
  const state = getState();
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const record = DataEntrySelectors.selectRecord(state);
  const { cycle: cycleKey } = record;
  const prevCycleKeys = Cycles.getPrevCycleKeys({ survey, cycleKey });

  if (prevCycleKeys.length <= 1) return prevCycleKeys[0];

  const confirmKeysPrefix =
    "dataEntry:recordInPreviousCycle.confirmShowValuesPreviousCycle.";
  const confirmResult = await ConfirmUtils.confirm({
    dispatch,
    titleKey: `${confirmKeysPrefix}title`,
    messageKey: `${confirmKeysPrefix}message`,
    singleChoiceOptions: prevCycleKeys.map((cycleKey) => ({
      value: cycleKey,
      label: `${confirmKeysPrefix}cycleItem`,
      labelParams: { cycleLabel: Cycles.labelFunction(cycleKey) },
    })),
    defaultSingleChoiceValue: Cycles.getPrevCycleKey(cycleKey),
  });
  if (confirmResult) {
    const { selectedSingleChoiceValue: selectedCycleKey } = confirmResult;
    return selectedCycleKey;
  }
  return undefined;
};

const linkToRecordInPreviousCycle = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const selectedCycleKey = await _askPreviousCycleKey({ dispatch, getState });
    if (Objects.isEmpty(selectedCycleKey)) return null;

    const survey = SurveySelectors.selectCurrentSurvey(state);
    const record = DataEntrySelectors.selectRecord(state);

    const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
    const fetchRecordFromPreviousCycleInternal = async () =>
      _fetchRecordFromPreviousCycleAndLinkIt({
        dispatch,
        survey,
        record,
        prevCycle: selectedCycleKey,
        lang,
      });
    const { keyValues, prevCycleRecordIds } =
      await fetchRecordFromPreviousCycleInternal();

    if (
      prevCycleRecordIds.length === 0 &&
      (await ConfirmUtils.confirm({
        dispatch,
        messageKey:
          "dataEntry:recordInPreviousCycle.confirmSyncRecordsSummaryAndTryAgain",
        messageParams: {
          cycle: Cycles.labelFunction(selectedCycleKey),
          keyValues,
        },
      }))
    ) {
      // record in previous cycle not found: try to update records list and fetch it again
      await RecordService.syncRecordSummaries({
        survey,
        cycle: selectedCycleKey,
      });
      await fetchRecordFromPreviousCycleInternal();
    }
  } catch (error) {
    const details = `${error.toString()} - ${error.stack}`;
    ToastActions.show("dataEntry:recordInPreviousCycleFetchError", { details });
  }
};

const unlinkFromRecordInPreviousCycle = () => async (dispatch) => {
  dispatch({ type: RECORD_PREVIOUS_CYCLE_RESET });
};

const updatePreviousCyclePageEntity = (dispatch, getState) => {
  const state = getState();
  const { parentEntityUuid, entityUuid } =
    DataEntrySelectors.selectCurrentPageEntity(state);

  const previousCycleParentEntity =
    DataEntrySelectors.selectPreviousCycleEntityWithSameKeys({
      entityUuid: parentEntityUuid,
    })(state);
  const previousCycleEntity =
    DataEntrySelectors.selectPreviousCycleEntityWithSameKeys({
      entityUuid,
    })(state);

  dispatch({
    type: PREVIOUS_CYCLE_PAGE_ENTITY_SET,
    payload: {
      previousCycleParentEntityUuid: previousCycleParentEntity?.uuid,
      previousCycleEntityUuid: previousCycleEntity?.uuid,
    },
  });
};

export const DataEntryActionsRecordPreviousCycle = {
  linkToRecordInPreviousCycle,
  unlinkFromRecordInPreviousCycle,
  updatePreviousCyclePageEntity,
};
