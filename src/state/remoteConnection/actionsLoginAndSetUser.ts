import { SecureStoreService, UserService } from "service";
import { AsyncStorageUtils } from "service/asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "service/asyncStorage/asyncStorageKeys";
import { log } from "utils/Logger";

import { AutoSyncActions } from "../autoSync";
import { DeviceInfoSelectors } from "../deviceInfo/selectors";
import { RemoteConnectionActionTypes } from "./actionTypes";
import { RemoteConnectionSelectors } from "./selectors";

const { USER_LOADING, USER_SET } = RemoteConnectionActionTypes;

const fetchUser = async () => {
  let user;
  try {
    user = await UserService.fetchUser();
    return user;
  } catch (error) {
    // ignore it
    log.error("Error fetching user", error);
    return null;
  }
};

export const loginAndSetUser =
  ({ onlyIfNotSet = true } = {}) =>
    async (dispatch: any, getState: any) => {
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
        dispatch({ type: USER_LOADING });
        const user = await fetchUser();
        dispatch({ type: USER_SET, user });
        if (user) {
          // credentials just proved valid again: drop any auto-sync auth error remembered from
          // before (see AutoSyncActions.reset)
          dispatch(AutoSyncActions.reset());
        }
      } else {
        // retrieve user from async storage (if any)
        const userInAsyncStorage = await AsyncStorageUtils.getItem(
          asyncStorageKeys.loggedInUser,
        );
        if (userInAsyncStorage) {
          dispatch({ type: USER_SET, user: userInAsyncStorage });
        }
      }
    };
