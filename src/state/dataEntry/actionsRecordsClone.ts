import { Surveys } from "@openforis/arena-core";

import { Cycles } from "model";
import { RecordService } from "service";
import { ConfirmUtils } from "state/confirm";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { SurveySelectors } from "state/survey";
import { ToastActions } from "state/toast";

import { ensureUserGroupReady } from "./actionsUserGroup";

const textKeyPrefix = "recordsList:cloneRecords.";

export const cloneRecordsIntoDefaultCycle =
  ({ recordSummaries, callback = null }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
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
      if (!(await ensureUserGroupReady({ dispatch, getState, survey }))) {
        return;
      }
      const stateUpdated = getState();
      const user = RemoteConnectionSelectors.selectLoggedUserSafe(stateUpdated);
      const userGroup =
        SurveySelectors.selectCurrentSurveyUserGroup(stateUpdated);
      await RecordService.cloneRecordsIntoDefaultCycle({
        survey,
        recordSummaries,
        user,
        userGroup,
      });
      dispatch(
        ToastActions.show(`${textKeyPrefix}completeSuccessfully`, {
          cycle: cycleLabel,
        }),
      );
      callback?.();
    }
  };
