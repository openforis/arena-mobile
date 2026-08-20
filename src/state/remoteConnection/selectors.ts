import { useSelector } from "react-redux";

import { Objects, User } from "@openforis/arena-core";

import { RemoteConnectionState, UserProfileIconInfo } from "./types";

const getRemoteConnectionState = (state: any): RemoteConnectionState =>
  state.remoteConnection;

const selectLoggedUser = (state: any): User | null =>
  getRemoteConnectionState(state).user;
const selectLoggedUserSafe = (state: any): User =>
  selectLoggedUser(state) ?? {} as User;
const selectLoggedUserIsLoading = (state: any): boolean =>
  !!getRemoteConnectionState(state).userLoading;
const selectLoggedUserProfileIconInfo = (state: any): UserProfileIconInfo =>
  getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,
  selectLoggedUserSafe,
  selectLoggedUserIsLoading,

  useLoggedInUser: () => useSelector(selectLoggedUser),
  useLoggedInUserIsLoading: () => useSelector(selectLoggedUserIsLoading),
  useLoggedInUserProfileIconInfo: () =>
    useSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
