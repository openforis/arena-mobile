import { useSelector } from "react-redux";

import { Objects } from "@openforis/arena-core";

const getRemoteConnectionState = (state) => state.remoteConnection;

const selectLoggedUser = (state) => getRemoteConnectionState(state).user;
const selectLoggedUserIsLoading = (state) =>
  !!getRemoteConnectionState(state).userLoading;
const selectLoggedUserProfileIconInfo = (state) =>
  getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,
  selectLoggedUserIsLoading,

  useLoggedInUser: () => useSelector(selectLoggedUser),
  useLoggedInUserIsLoading: () => useSelector(selectLoggedUserIsLoading),
  useLoggedInUserProfileIconInfo: () =>
    useSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
