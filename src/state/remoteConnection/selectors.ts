import { Authorizer, Objects, User, Users } from "@openforis/arena-core";

import { SurveySelectors } from "../survey/selectors";
import { RemoteConnectionState, UserProfileIconInfo } from "./types";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const getRemoteConnectionState = (state: RootState): RemoteConnectionState =>
  state.remoteConnection;

const selectLoggedUser = (state: RootState): User | null =>
  getRemoteConnectionState(state).user;
// props needed by arena-core when evaluating expressions with userProp (e.g. not logged in, web preview)
const selectLoggedUserSafe = (state: RootState): User =>
  selectLoggedUser(state) ?? ({ props: {} } as User);
const selectLoggedUserIsSystemAdmin = (state: RootState): boolean => {
  const user = selectLoggedUser(state);
  return !!user && Users.isSystemAdmin(user);
};
// offline-first: without a logged user or a role in the survey (e.g. survey not from the server) records can be created;
// roles without the record create permission (e.g. survey guest) can only view the records
const selectLoggedUserCanCreateRecords = (state: RootState): boolean => {
  const user = selectLoggedUser(state);
  const survey = SurveySelectors.selectCurrentSurvey(state);
  if (!user || !survey) return true;
  if (!Users.getAuthGroupBySurveyUuid(survey.uuid)(user)) return true;
  return Authorizer.canCreateRecord(user, survey);
};
const selectLoggedUserIsLoading = (state: RootState): boolean =>
  !!getRemoteConnectionState(state).userLoading;
const selectLoggedUserProfileIconInfo = (
  state: RootState,
): UserProfileIconInfo => getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,
  selectLoggedUserSafe,
  selectLoggedUserIsSystemAdmin,
  selectLoggedUserCanCreateRecords,
  selectLoggedUserIsLoading,

  useLoggedInUser: () => useAppSelector(selectLoggedUser),
  useLoggedInUserIsSystemAdmin: () =>
    useAppSelector(selectLoggedUserIsSystemAdmin),
  useLoggedInUserCanCreateRecords: () =>
    useAppSelector(selectLoggedUserCanCreateRecords),
  useLoggedInUserIsLoading: () => useAppSelector(selectLoggedUserIsLoading),
  useLoggedInUserProfileIconInfo: () =>
    useAppSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
