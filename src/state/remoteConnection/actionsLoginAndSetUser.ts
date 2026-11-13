import { SecureStoreService, UserService } from "service";
import { AsyncStorageUtils } from "service/asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "service/asyncStorage/asyncStorageKeys";
import { log } from "utils/Logger";

import { AutoSyncActions } from "../autoSync";
import { DeviceInfoSelectors } from "../deviceInfo/selectors";
import { RemoteConnectionActionTypes } from "./actionTypes";
import { RemoteConnectionSelectors } from "./selectors";
import type { AppDispatch, AppGetState } from "../store";

const { USER_LOADING, USER_SET } = RemoteConnectionActionTypes;

const getUserInAsyncStorage = () =>
  AsyncStorageUtils.getItem(asyncStorageKeys.loggedInUser);

const fetchUser = async () => {
  try {
    return await UserService.fetchUser();
  } catch (error: any) {
    log.error("Error fetching user", error);
    // session no longer valid: a new login is required
    if (error?.response?.status === 401) return null;
    // server not reachable (e.g. network connected but no internet): keep the last logged in user
    return getUserInAsyncStorage();
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
      const userInAsyncStorage = await getUserInAsyncStorage();
      dispatch({ type: USER_LOADING, user: userInAsyncStorage });
      const user = await fetchUser();
      dispatch({ type: USER_SET, user });
      if (user) {
        // credentials just proved valid again: drop any auto-sync auth error remembered from
        // before (see AutoSyncActions.reset)
        dispatch(AutoSyncActions.reset());
      }
    } else {
      // retrieve user from async storage (if any)
      const userInAsyncStorage = await getUserInAsyncStorage();
      if (userInAsyncStorage) {
        dispatch({ type: USER_SET, user: userInAsyncStorage });
      }
    }
  };
