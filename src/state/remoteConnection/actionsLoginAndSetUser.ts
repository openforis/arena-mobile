import { SecureStoreService, UserService } from "service";
import { HttpErrors } from "utils/HttpErrors";
import { log } from "utils/Logger";

import { AutoSyncActions } from "../autoSync";
import { DeviceInfoSelectors } from "../deviceInfo/selectors";
import { RemoteConnectionSliceActions } from "./reducer";
import { RemoteConnectionSelectors } from "./selectors";
import type { AppDispatch, AppGetState } from "../store";

const fetchUser = async () => {
  try {
    return await UserService.fetchUser();
  } catch (error: any) {
    log.error("Error fetching user", error);
    // session no longer valid: a new login is required
    if (HttpErrors.isUnauthorizedResponse(error)) return null;
    // server not reachable (e.g. network connected but no internet): keep the last logged in user
    return UserService.fetchLastLoggedInUser();
  }
};

// concurrent calls (e.g. app startup and survey user group fetch) share the same request
let loginInProgress: Promise<void> | null = null;

export const loginAndSetUser =
  ({ onlyIfNotSet = true } = {}) =>
  (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
    loginInProgress ??= _loginAndSetUser({ onlyIfNotSet })(
      dispatch,
      getState,
    ).finally(() => {
      loginInProgress = null;
    });
    return loginInProgress;
  };

const _loginAndSetUser =
  ({ onlyIfNotSet }: { onlyIfNotSet: boolean }) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    if (onlyIfNotSet) {
      // if user is already set in store, do not try to fetch it again
      const userPrev = RemoteConnectionSelectors.selectLoggedUser(state);
      if (userPrev) {
        return;
      }
    }
    const deviceInfo = DeviceInfoSelectors.selectDeviceInfo(state);
    const { isNetworkConnected } = deviceInfo;
    if (isNetworkConnected) {
      const refreshToken = await SecureStoreService.getAuthRefreshToken();
      if (!refreshToken) {
        // missing information; user cannot be fetched;
        return;
      }
      // the last logged in user is used (e.g. for permissions) until the server answers
      const lastLoggedInUser = await UserService.fetchLastLoggedInUser();
      dispatch(RemoteConnectionSliceActions.userLoading(lastLoggedInUser));
      const user = await fetchUser();
      dispatch(RemoteConnectionSliceActions.userSet(user));
      if (user) {
        // credentials just proved valid again: drop any auto-sync auth error remembered from
        // before (see AutoSyncActions.reset)
        dispatch(AutoSyncActions.reset());
      }
    } else {
      // use the last logged in user (if any)
      const lastLoggedInUser = await UserService.fetchLastLoggedInUser();
      if (lastLoggedInUser) {
        dispatch(RemoteConnectionSliceActions.userSet(lastLoggedInUser));
      }
    }
  };
