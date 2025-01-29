import { useSelector } from "react-redux";

import { Objects } from "@openforis/arena-core";

const getRemoteConnectionState = (state) => state.remoteConnection;

const selectLoggedUser = (state) => getRemoteConnectionState(state).user;
const selectLoggedUserProfileIconInfo = (state) =>
  getRemoteConnectionState(state).userProfileIconInfo;

export const RemoteConnectionSelectors = {
  selectLoggedUser,

  useLoggedInUser: () => useSelector(selectLoggedUser),
  useLoggedInUserProfileIconInfo: () =>
    useSelector(selectLoggedUserProfileIconInfo, Objects.isEqual),
};
