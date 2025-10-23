import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { Cycles } from "model";
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { RecordService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'state/confirm' or its correspo... Remove this comment to see the full error message
import { ConfirmUtils } from "state/confirm";
// @ts-expect-error TS(2307): Cannot find module 'state/survey' or its correspon... Remove this comment to see the full error message
import { SurveySelectors } from "state/survey";
// @ts-expect-error TS(2307): Cannot find module 'state/toast' or its correspond... Remove this comment to see the full error message
import { ToastActions } from "state/toast";

const textKeyPrefix = "recordsList:cloneRecords.";

export const cloneRecordsIntoDefaultCycle =
  ({
    recordSummaries,
    callback = null
  }: any) =>
  async (dispatch: any, getState: any) => {
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
