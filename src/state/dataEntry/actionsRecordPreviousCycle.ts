import {
  ArenaRecord,
  ArenaRecordNode,
  Dictionary,
  Objects,
  RecordNodesUpdater,
  Records,
  Survey,
  User,
} from "@openforis/arena-core";

import {
  ArenaMobileRecord,
  Cycles,
  RecordLoadStatus,
  RecordOrigin,
  RecordUtils,
  SurveyDefs,
} from "model";
import { RecordService } from "service";
import { log } from "utils";
import { ConfirmUtils } from "../confirm";
import { SurveySelectors } from "../survey";
import { ToastActions } from "../toast";

import { RemoteConnectionSelectors } from "state/remoteConnection";
import { DataEntryActionTypes } from "./actionTypes";
import { fetchRecordsFromServer } from "./actionsRecordsImport";
import { DataEntrySelectors } from "./selectors";

const {
  PREVIOUS_CYCLE_PAGE_ENTITY_SET,
  RECORD_PREVIOUS_CYCLE_LOAD,
  RECORD_PREVIOUS_CYCLE_SET,
  RECORD_PREVIOUS_CYCLE_RESET,
} = DataEntryActionTypes;

const updateCurrentRecordWithPrevCycleValues = async ({
  dispatch,
  user,
  survey,
  currentCycleRecord,
  nodeDefUuidsUsingPrevCycleValueFunctions,
  prevCycleRecord,
}: {
  dispatch: any;
  user: User;
  survey: Survey;
  currentCycleRecord: ArenaRecord;
  nodeDefUuidsUsingPrevCycleValueFunctions: string[];
  prevCycleRecord: ArenaMobileRecord;
}): Promise<void> => {
  const nodesToUpdateByUuid: Dictionary<ArenaRecordNode> = {};
  for (const nodeDefUuid of nodeDefUuidsUsingPrevCycleValueFunctions) {
    const nodes = Records.getNodesByDefUuid(nodeDefUuid)(currentCycleRecord);
    for (const node of nodes) {
      nodesToUpdateByUuid[node.uuid] = node;
    }
  }
  const { record: currentCycleRecordUpdated } =
    await RecordNodesUpdater.updateNodesDependents({
      survey,
      record: currentCycleRecord,
      nodes: nodesToUpdateByUuid,
      user,
      prevCycleRecord,
      sideEffect: false,
    });
  await dispatch({
    type: DataEntryActionTypes.RECORD_SET,
    record: currentCycleRecordUpdated,
  });
};

const _fetchRecordFromPreviousCycleAndLinkItInternal = async ({
  dispatch,
  user,
  survey,
  currentCycleRecord,
  recordId,
}: {
  dispatch: any;
  user: User;
  survey: Survey;
  currentCycleRecord: ArenaRecord;
  recordId: number;
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
    const prevCycleRecord = await RecordService.fetchRecord({
      survey,
      recordId,
    });
    const nodeDefUuidsUsingPrevCycleValueFunctions =
      SurveyDefs.findNodeDefUuidsUsingPrevCycleValueFunctions(survey);

    if (nodeDefUuidsUsingPrevCycleValueFunctions.length > 0) {
      log.debug(
        "record in current cycle has nodeDefs with prevCycleValue functions, recalculating values",
      );
      await updateCurrentRecordWithPrevCycleValues({
        dispatch,
        user,
        survey,
        currentCycleRecord,
        nodeDefUuidsUsingPrevCycleValueFunctions,
        prevCycleRecord,
      });
    }
    await dispatch({
      type: RECORD_PREVIOUS_CYCLE_SET,
      record: prevCycleRecord,
    });
    dispatch(ToastActions.show("dataEntry:recordInPreviousCycle.foundMessage"));
    dispatch(updatePreviousCyclePageEntity);
  }
  dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: false });
  return loaded;
};

const _fetchRecordFromPreviousCycleAndLinkIt = async ({
  dispatch,
  user,
  survey,
  record,
  prevCycle,
  lang,
}: {
  dispatch: any;
  user: User;
  survey: Survey;
  record: ArenaRecord;
  prevCycle: string;
  lang: string;
}): Promise<{
  keyValues: string;
  prevCycleRecordIds: number[];
} | null> => {
  try {
    dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: true });

    const prevCycleString = Cycles.labelFunction(prevCycle);

    const keyValuesString = RecordUtils.getRootEntityKeysFormatted({
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
        }),
      );
    } else if (prevCycleRecordSummaries.length === 1) {
      const prevCycleRecordSummary = prevCycleRecordSummaries[0]!;
      const { id: prevCycleRecordId, uuid: prevCycleRecordUuid } =
        prevCycleRecordSummary;

      const doFetch = async () =>
        _fetchRecordFromPreviousCycleAndLinkItInternal({
          dispatch,
          survey,
          user,
          currentCycleRecord: record,
          recordId: prevCycleRecordId!,
        });
      if (!(await doFetch())) {
        if (
          await ConfirmUtils.confirm({
            dispatch,
            messageKey:
              "dataEntry:recordInPreviousCycle.confirmFetchRecordInCycle",
            messageParams: {
              cycle: prevCycleString,
              keyValues: keyValuesString,
            },
          })
        ) {
          dispatch(
            fetchRecordsFromServer({
              recordUuids: [prevCycleRecordUuid],
              onImportComplete: doFetch,
            }),
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
          },
        ),
      );
    }

    return {
      keyValues: keyValuesString,
      prevCycleRecordIds: prevCycleRecordSummaries.map(
        (recordSummary) => recordSummary.id!,
      ),
    };
  } catch (error) {
    log.error(error);
    return null;
  } finally {
    dispatch({ type: RECORD_PREVIOUS_CYCLE_LOAD, loading: false });
  }
};

const _askPreviousCycleKey = async ({ dispatch, getState }: any) => {
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

const linkToRecordInPreviousCycle =
  () => async (dispatch: any, getState: any) => {
    try {
      const state = getState();
      const selectedCycleKey = await _askPreviousCycleKey({
        dispatch,
        getState,
      });
      if (Objects.isEmpty(selectedCycleKey)) return;

      const user = RemoteConnectionSelectors.selectLoggedUser(state);
      const survey = SurveySelectors.selectCurrentSurvey(state)!;
      const record = DataEntrySelectors.selectRecord(state);

      const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
      const fetchRecordFromPreviousCycleInternal = async () =>
        _fetchRecordFromPreviousCycleAndLinkIt({
          dispatch,
          user,
          survey,
          record,
          prevCycle: selectedCycleKey!,
          lang,
        });
      const { keyValues, prevCycleRecordIds } =
        (await fetchRecordFromPreviousCycleInternal()) ?? ({} as any);

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
    } catch (error: any) {
      const details = `${error.toString()} - ${error.stack}`;
      ToastActions.show("dataEntry:recordInPreviousCycleFetchError", {
        details,
      });
    }
  };

const unlinkFromRecordInPreviousCycle = () => async (dispatch: any) => {
  dispatch({ type: RECORD_PREVIOUS_CYCLE_RESET });
};

const updatePreviousCyclePageEntity = (dispatch: any, getState: any) => {
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
