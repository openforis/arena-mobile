import { useSelector } from "react-redux";

import { Objects, User, Users } from "@openforis/arena-core";

import { RemoteConnectionState, UserProfileIconInfo } from "./types";

const getRemoteConnectionState = (state: any): RemoteConnectionState =>
  state.remoteConnection;

const selectLoggedUser = (state: any): User | null =>
  getRemoteConnectionState(state).user;
const selectLoggedUserSafe = (state: any): User =>
  selectLoggedUser(state) ?? {} as User;
const selectLoggedUserIsSystemAdmin = (state: any): boolean => {
  const user = selectLoggedUser(state);
  return !!user && Users.isSystemAdmin(user);
};
const selectLoggedUserIsLoading = (state: any): boolean =>
  !!getRemoteConnectionState(state).userLoading;
const selectLoggedUserProfileIconInfo = (state: any): UserProfileIconInfo =>
  getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,
  selectLoggedUserSafe,
  selectLoggedUserIsSystemAdmin,
  selectLoggedUserIsLoading,

  useLoggedInUser: () => useSelector(selectLoggedUser),
  useLoggedInUserIsSystemAdmin: () =>
    useSelector(selectLoggedUserIsSystemAdmin),
  useLoggedInUserIsLoading: () => useSelector(selectLoggedUserIsLoading),
  useLoggedInUserProfileIconInfo: () =>
    useSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
