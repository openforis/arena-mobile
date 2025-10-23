import { useSelector } from "react-redux";

import { Objects } from "@openforis/arena-core";

const getRemoteConnectionState = (state: any) => state.remoteConnection;

const selectLoggedUser = (state: any) => getRemoteConnectionState(state).user;
const selectLoggedUserIsLoading = (state: any) => !!getRemoteConnectionState(state).userLoading;
const selectLoggedUserProfileIconInfo = (state: any) => getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,
  selectLoggedUserIsLoading,

  useLoggedInUser: () => useSelector(selectLoggedUser),
  useLoggedInUserIsLoading: () => useSelector(selectLoggedUserIsLoading),
  useLoggedInUserProfileIconInfo: () =>
    useSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
