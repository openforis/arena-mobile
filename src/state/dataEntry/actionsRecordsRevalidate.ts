import { RecordService } from "service";
import { ConfirmUtils } from "state/confirm";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { SurveySelectors } from "state/survey";
import { ToastActions } from "state/toast";

const textKeyPrefix = "recordsList:revalidateRecords.";

export const revalidateRecords =
  ({ recordIds, callback = null }: any) =>
    async (dispatch: any, getState: any) => {
      if (recordIds.length === 0) return;

      const state = getState();
      const survey = SurveySelectors.selectCurrentSurvey(state)!;
      const user = RemoteConnectionSelectors.selectLoggedUserSafe(state);

      if (
        await ConfirmUtils.confirm({
          dispatch,
          confirmButtonTextKey: `${textKeyPrefix}title`,
          messageKey: `${textKeyPrefix}confirm.message`,
          messageParams: { recordsCount: recordIds.length },
          titleKey: `${textKeyPrefix}title`,
        })
      ) {
        await RecordService.revalidateRecords({ user, survey, recordIds });
        dispatch(ToastActions.show(`${textKeyPrefix}completeSuccessfully`));
        callback?.();
      }
    };
