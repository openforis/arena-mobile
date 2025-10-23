import { Surveys } from "@openforis/arena-core";

import { Cycles } from "model";
import { RecordService } from "service";
import { ConfirmUtils } from "state/confirm";
import { SurveySelectors } from "state/survey";
import { ToastActions } from "state/toast";

const textKeyPrefix = "recordsList:cloneRecords.";

export const cloneRecordsIntoDefaultCycle =
  ({ recordSummaries, callback = null }) =>
  async (dispatch, getState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const cycle = Surveys.getDefaultCycleKey(survey);
    const cycleLabel = Cycles.labelFunction(cycle);

    if (
      await ConfirmUtils.confirm({
        dispatch,
        confirmButtonTextKey: `${textKeyPrefix}title`,
        messageKey: `${textKeyPrefix}confirm.message`,
        messageParams: {
          cycle: cycleLabel,
          recordsCount: recordSummaries.length,
        },
        titleKey: `${textKeyPrefix}title`,
      })
    ) {
      await RecordService.cloneRecordsIntoDefaultCycle({
        survey,
        recordSummaries,
      });
      dispatch(
        ToastActions.show(`${textKeyPrefix}completeSuccessfully`, {
          cycle: cycleLabel,
        })
      );
      callback?.();
    }
  };
