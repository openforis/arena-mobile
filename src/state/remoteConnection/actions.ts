import { i18n } from "localization";
import { UserLogoutOptions } from "model/UserLogoutOptions";
import {
  AuthService,
  SecureStoreService,
  SettingsService,
  UserService,
} from "service";
import { screenKeys } from "screens/screenKeys";

import { ConfirmActions, ConfirmUtils } from "../confirm";
import { MessageActions } from "../message";
import { SettingsActions } from "../settings";
import { RemoteConnectionSelectors } from "./selectors";
import { DeviceInfoSelectors } from "state/deviceInfo";
import { AsyncStorageUtils } from "service/asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "service/asyncStorage/asyncStorageKeys";

const LOGGED_OUT = "LOGGED_OUT";
const USER_LOADING = "USER_LOADING";
const USER_SET = "USER_SET";
const USER_PROFILE_ICON_INFO_SET = "USER_PROFILE_ICON_INFO_SET";

const fetchUserOrLoginAgain = async ({ serverUrl, email, password }: any) => {
  let user;
  try {
    user = await UserService.fetchUser();
  } catch (error) {
    // ignore it
  }
  if (user) {
    return user;
  }
  // session expired
  const data = await AuthService.login({ serverUrl, email, password });
  return data.user;
};

const loginAndSetUser =
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
    if (!isNetworkConnected) {
      // retrieve user from async storage (if any)
      const userInAsyncStorage = await AsyncStorageUtils.getItem(
        asyncStorageKeys.loggedInUser
      );
      if (userInAsyncStorage) {
        dispatch({ type: USER_SET, user: userInAsyncStorage });
      }
      return;
    }

    const settings = await SettingsService.fetchSettings();
    const { serverUrl, email, password } = settings;
    if (!serverUrl || !email || !password) {
      // missing information to perform login; user cannot be fetched;
      return;
    }
    dispatch({ type: USER_LOADING });
    const connectSID = await SecureStoreService.getAuthRefreshToken();
    let user = null;
    if (connectSID) {
      user = await fetchUserOrLoginAgain({ serverUrl, email, password });
    } else {
      const loginRes = await AuthService.login({ serverUrl, email, password });
      user = loginRes.user;
    }
    dispatch({ type: USER_SET, user });
  };

const confirmGoToConnectionToRemoteServer =
  ({ navigation }: any) =>
  (dispatch: any) => {
    dispatch(
      ConfirmActions.show({
        confirmButtonTextKey: "settings:connectionToServer",
        messageKey: "settingsRemoteConnection:errorConnectingWithServer",
        titleKey: "authService:loginRequired",
        onConfirm: () =>
          navigation.navigate(screenKeys.settingsRemoteConnection),
      })
    );
  };

const login =
  ({
    serverUrl,
    email,
    password,
    savePassword = false,
    navigation = null,
    showBack = false,
  }: any) =>
  async (dispatch: any) => {
    const res = await AuthService.login({ serverUrl, email, password });
    const { user, error, message } = res;
    if (user) {
      await AsyncStorageUtils.setItem(asyncStorageKeys.loggedInUser, user);
      const settings = await SettingsService.fetchSettings();
      const settingsUpdated = { ...settings, serverUrl, email };
      if (savePassword) {
        Object.assign(settingsUpdated, { password });
      }
      await dispatch(SettingsActions.updateSettings(settingsUpdated));
      if (showBack) {
        dispatch(
          ConfirmActions.show({
            titleKey: "authService:loginSuccessful",
            confirmButtonTextKey: "common:goBack",
            cancelButtonTextKey: "common:close",
            onConfirm: navigation.goBack,
          })
        );
      }
      dispatch({ type: USER_SET, user });
    } else if (message || error) {
      const errorKeySuffix = [
        "validationErrors.user.userNotFound",
        "validationErrors.user.emailInvalid",
      ].includes(message)
        ? "invalidCredentials"
        : "generic";
      const errorKey = `authService:error.${errorKeySuffix}`;
      const details = i18n.t(error ?? message);

      dispatch(
        MessageActions.setMessage({
          content: errorKey,
          contentParams: { details },
        })
      );
    }
  };

const fetchLoggedInUserProfileIcon = async (dispatch: any, getState: any) => {
  if (__DEV__) console.log("fetching user profile icon");
  const state = getState();
  const user = RemoteConnectionSelectors.selectLoggedUser(state);
  if (!user) return;
  dispatch({
    type: USER_PROFILE_ICON_INFO_SET,
    payload: { loaded: false, loading: true, uri: null },
  });
  const uri = await UserService.fetchUserPicture(user.uuid);
  dispatch({
    type: USER_PROFILE_ICON_INFO_SET,
    payload: { loaded: true, loading: false, uri },
  });
};

const _clearUserCredentialsInternal =
  ({ keepEmailAddress }: any = {}) =>
  async (dispatch: any) => {
    const settings = await SettingsService.fetchSettings();
    const settingsUpdated = {
      ...settings,
      email: keepEmailAddress ? settings.email : null,
      password: null,
    };
    await dispatch(SettingsActions.updateSettings(settingsUpdated));
    dispatch({ type: USER_PROFILE_ICON_INFO_SET, payload: null });
    dispatch({ type: USER_SET, user: null });
  };

const clearUserCredentials = () => async (dispatch: any) => {
  const confirmButtonTextKey = "settingsRemoteConnection:clearCredentials";
  const confirmMessageKey = confirmButtonTextKey + "ConfirmMessage";
  if (
    await ConfirmUtils.confirm({
      dispatch,
      messageKey: confirmMessageKey,
      confirmButtonTextKey,
    })
  ) {
    dispatch(_clearUserCredentialsInternal());
  }
};

const _doLogout =
  ({ keepEmailAddress }: any) =>
  async (dispatch: any) => {
    await AuthService.logout();
    await AsyncStorageUtils.removeItem(asyncStorageKeys.loggedInUser);
    dispatch(_clearUserCredentialsInternal({ keepEmailAddress }));
  };

const logout = () => (dispatch: any) => {
  dispatch(
    ConfirmActions.show({
      confirmButtonTextKey: "authService:logout",
      messageKey: "authService:logoutConfirmMessage",
      multipleChoiceOptions: Object.values(UserLogoutOptions).map(
        (logoutOption) => ({
          value: logoutOption,
          label: `authService:logoutOptions.${logoutOption}`,
        })
      ),
      titleKey: "authService:logout",
      onConfirm: ({ selectedMultipleChoiceValues }: any) =>
        dispatch(
          _doLogout({
            keepEmailAddress: selectedMultipleChoiceValues.includes(
              UserLogoutOptions.keepEmailAddress
            ),
          })
        ),
    })
  );
};

export const RemoteConnectionActions = {
  LOGGED_OUT,
  USER_LOADING,
  USER_SET,
  USER_PROFILE_ICON_INFO_SET,
  confirmGoToConnectionToRemoteServer,
  loginAndSetUser,
  login,
  fetchLoggedInUserProfileIcon,
  clearUserCredentials,
  logout,
};
