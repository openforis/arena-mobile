import { useSelector } from "react-redux";

import { Authorizer, Objects, User, Users } from "@openforis/arena-core";

import { SurveySelectors } from "../survey/selectors";
import { RemoteConnectionState, UserProfileIconInfo } from "./types";

const getRemoteConnectionState = (state: any): RemoteConnectionState =>
  state.remoteConnection;

const selectLoggedUser = (state: any): User | null =>
  getRemoteConnectionState(state).user;
// props needed by arena-core when evaluating expressions with userProp (e.g. not logged in, web preview)
const selectLoggedUserSafe = (state: any): User =>
  selectLoggedUser(state) ?? ({ props: {} } as User);
const selectLoggedUserIsSystemAdmin = (state: any): boolean => {
  const user = selectLoggedUser(state);
  return !!user && Users.isSystemAdmin(user);
};
// offline-first: without a logged user or a role in the survey (e.g. survey not from the server) records can be created;
// roles without the record create permission (e.g. survey guest) can only view the records
const selectLoggedUserCanCreateRecords = (state: any): boolean => {
  const user = selectLoggedUser(state);
  const survey = SurveySelectors.selectCurrentSurvey(state);
  if (!user || !survey) return true;
  if (!Users.getAuthGroupBySurveyUuid(survey.uuid)(user)) return true;
  return Authorizer.canCreateRecord(user, survey);
};
const selectLoggedUserIsLoading = (state: any): boolean =>
  !!getRemoteConnectionState(state).userLoading;
const selectLoggedUserProfileIconInfo = (state: any): UserProfileIconInfo =>
  getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,
  selectLoggedUserSafe,
  selectLoggedUserIsSystemAdmin,
  selectLoggedUserCanCreateRecords,
  selectLoggedUserIsLoading,

  useLoggedInUser: () => useSelector(selectLoggedUser),
  useLoggedInUserIsSystemAdmin: () =>
    useSelector(selectLoggedUserIsSystemAdmin),
  useLoggedInUserCanCreateRecords: () =>
    useSelector(selectLoggedUserCanCreateRecords),
  useLoggedInUserIsLoading: () => useSelector(selectLoggedUserIsLoading),
  useLoggedInUserProfileIconInfo: () =>
    useSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
