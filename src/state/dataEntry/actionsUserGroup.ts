import { Surveys } from "@openforis/arena-core";

import { ConfirmUtils } from "../confirm";
import { RemoteConnectionActions } from "../remoteConnection";
import { SurveyActions, SurveySelectors } from "../survey";
import { ToastActions } from "../toast";

// Qualifier attributes are prefilled from the user's UserGroup (see UserGroupQualifiers.assignQualifierValues).
// If the group hasn't been fetched yet (e.g. right after app startup or login, before the
// best-effort background fetch resolves), we can't tell whether the user genuinely has no
// group or whether we just haven't asked the server yet. Offer to fetch again rather than
// silently creating (or cloning) a record with missing/incorrect prefilled values.
export const ensureUserGroupReady = async ({
  dispatch,
  getState,
  survey,
}: any): Promise<boolean> => {
  if (Surveys.getQualifierDefs({ survey }).length === 0) return true;

  const isReady = () =>
    SurveySelectors.selectCurrentSurveyUserGroupReady(getState());

  if (isReady()) return true;

  const confirmed = await ConfirmUtils.confirm({
    dispatch,
    titleKey: "dataEntry:userGroupNotReady.title",
    messageKey: "dataEntry:userGroupNotReady.message",
    confirmButtonTextKey: "dataEntry:userGroupNotReady.fetchAgain",
  });
  if (!confirmed) return false;

  await dispatch(
    RemoteConnectionActions.loginAndSetUser({ onlyIfNotSet: false }),
  );
  await dispatch(SurveyActions.fetchCurrentSurveyUserGroup({ survey }));

  if (!isReady()) {
    dispatch(ToastActions.show("dataEntry:userGroupNotReady.stillNotReady"));
    return false;
  }
  return true;
};
