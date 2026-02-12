import { Objects, User } from "@openforis/arena-core";

import { i18n } from "localization";
import { UserLogoutOptions } from "model/UserLogoutOptions";
import {
  AuthService,
  SecureStoreService,
  SettingsService,
  UserService,
} from "service";
import { screenKeys } from "screens/screenKeys";
import { log } from "utils";

import { ConfirmActions, ConfirmUtils } from "../confirm";
import { MessageActions } from "../message";
import { SettingsActions } from "../settings";
import { RemoteConnectionSelectors } from "./selectors";
import { DeviceInfoSelectors } from "state/deviceInfo";
import { AsyncStorageUtils } from "service/asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "service/asyncStorage/asyncStorageKeys";
import { LoginResponse } from "service/authService";

const LOGGED_OUT = "LOGGED_OUT";
const USER_LOADING = "USER_LOADING";
const USER_SET = "USER_SET";
const USER_PROFILE_ICON_INFO_SET = "USER_PROFILE_ICON_INFO_SET";

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
    if (isNetworkConnected) {
      const refreshToken = await SecureStoreService.getAuthRefreshToken();
      if (!refreshToken) {
        // missing information; user cannot be fetched;
        return;
      }
      dispatch({ type: USER_LOADING });
      const user = await fetchUser();
      dispatch({ type: USER_SET, user });
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
      }),
    );
  };

const onLoginResponseSuccessful = async ({
  user,
  email,
  serverUrl,
  showBack,
  dispatch,
  navigation,
}: {
  user: User;
  email: string | undefined;
  serverUrl: string;
  showBack: boolean | undefined;
  dispatch: any;
  navigation: any;
}) => {
  const userEmail = user.email ?? email;
  await AsyncStorageUtils.setItem(asyncStorageKeys.loggedInUser, user);
  const settings = await SettingsService.fetchSettings();
  const settingsUpdated = { ...settings, serverUrl, email: userEmail };
  await dispatch(SettingsActions.updateSettings(settingsUpdated));

  dispatch({ type: USER_SET, user });

  if (showBack) {
    dispatch(
      ConfirmActions.show({
        titleKey: "authService:loginSuccessful",
        confirmButtonTextKey: "common:continue",
        cancelButtonTextKey: "common:close",
        onConfirm: navigation.goBack,
      }),
    );
  }
};

const onLoginResponse = async ({
  dispatch,
  navigation,
  res,
  serverUrl,
  email,
  password,
  twoFactorToken,
  showBack,
}: {
  dispatch: any;
  navigation: any;
  res: LoginResponse;
  serverUrl: string;
  email?: string;
  password?: string;
  twoFactorToken?: string;
  showBack?: boolean;
}) => {
  const { user, error, message, twoFactorRequired } = res;
  if (user) {
    await onLoginResponseSuccessful({
      user,
      email,
      serverUrl,
      showBack,
      dispatch,
      navigation,
    });
  } else if (twoFactorRequired || twoFactorToken) {
    dispatch(
      ConfirmActions.show({
        titleKey: "authService:twoFactorRequiredConfirm.title",
        messageKey: twoFactorToken
          ? "authService:twoFactorRequiredConfirm.messageError"
          : "authService:twoFactorRequiredConfirm.message",
        confirmButtonTextKey: "common:continue",
        confirmButtonEnableFn: ({ textInputValue }) =>
          Objects.isNotEmpty(textInputValue),
        cancelButtonTextKey: "common:cancel",
        onConfirm: ({ textInputValue }) => {
          dispatch(
            login({
              navigation,
              serverUrl,
              email: email!,
              password: password!,
              twoFactorToken: textInputValue,
              showBack,
            }),
          );
        },
        textInputToConfirm: true,
        textInputToConfirmLabelKey: "authService:twoFactorCode",
      }),
    );
  } else if (message || error) {
    const errorKeySuffix =
      message &&
      [
        "validationErrors.user.userNotFound",
        "validationErrors.user.emailInvalid",
      ].includes(message)
        ? "invalidCredentials"
        : "generic";
    const errorKey = `authService:error.${errorKeySuffix}`;
    const details = i18n.t(error || message || "");

    dispatch(
      MessageActions.setMessage({
        content: errorKey,
        contentParams: { details },
      }),
    );
  }
};

const login =
  ({
    navigation,
    serverUrl,
    email,
    password,
    twoFactorToken,
    showBack = false,
  }: {
    navigation: any;
    serverUrl: string;
    email: string;
    password: string;
    showBack?: boolean;
    twoFactorToken?: string;
  }) =>
  async (dispatch: any) => {
    const res = await AuthService.login({
      serverUrl,
      email,
      password,
      twoFactorToken,
    });
    await onLoginResponse({
      res,
      email,
      password,
      twoFactorToken,
      serverUrl,
      dispatch,
      showBack,
      navigation,
    });
  };

const loginWithTempAuthToken =
  ({
    navigation,
    serverUrl,
    token,
    showBack = false,
  }: {
    navigation: any;
    serverUrl: string;
    token: string;
    showBack?: boolean;
  }) =>
  async (dispatch: any) => {
    const res = await AuthService.loginWithTempAuthToken({ serverUrl, token });
    await onLoginResponse({
      res,
      dispatch,
      navigation,
      serverUrl,
      showBack,
    });
  };

const fetchLoggedInUserProfileIcon = async (dispatch: any, getState: any) => {
  log.debug("fetching user profile icon");
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
    const emailNext = keepEmailAddress ? settings.email : undefined;
    const settingsUpdated = {
      ...settings,
      email: emailNext,
      password: undefined,
    };
    await dispatch(SettingsActions.updateSettings(settingsUpdated));
    await SecureStoreService.setAuthRefreshToken(null);
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
        }),
      ),
      titleKey: "authService:logout",
      onConfirm: ({ selectedMultipleChoiceValues }: any) =>
        dispatch(
          _doLogout({
            keepEmailAddress: selectedMultipleChoiceValues.includes(
              UserLogoutOptions.keepEmailAddress,
            ),
          }),
        ),
    }),
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
  loginWithTempAuthToken,
  fetchLoggedInUserProfileIcon,
  clearUserCredentials,
  logout,
};
