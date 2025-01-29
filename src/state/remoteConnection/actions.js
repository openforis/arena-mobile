import { i18n } from "localization";
import { UserLogoutOptions } from "model/UserLogoutOptions";
import { AuthService, SecureStoreService, SettingsService } from "service";
import { screenKeys } from "screens/screenKeys";

import { ConfirmActions, ConfirmUtils } from "../confirm";
import { MessageActions } from "../message";
import { SettingsActions } from "../settings";
import { RemoteConnectionSelectors } from "./selectors";

const LOGGED_OUT = "LOGGED_OUT";
const USER_SET = "USER_SET";
const USER_PROFILE_ICON_INFO_SET = "USER_PROFILE_ICON_INFO_SET";

const fetchUserOrLoginAgain = async ({ serverUrl, email, password }) => {
  try {
    const user = await AuthService.fetchUser();
    return user;
  } catch (error) {
    // session expired
    const { user } = await AuthService.login({ serverUrl, email, password });
    return user;
  }
};

const checkLoggedIn = () => async (dispatch) => {
  const settings = await SettingsService.fetchSettings();
  const { serverUrl, email, password } = settings;
  if (!serverUrl || !email || !password) return;
  const connectSID = await SecureStoreService.getConnectSIDCookie();
  let user = null;
  if (!connectSID) {
    const loginRes = await AuthService.login({ serverUrl, email, password });
    user = loginRes.user;
  } else {
    user = await fetchUserOrLoginAgain({ serverUrl, email, password });
  }
  if (user) {
    dispatch({ type: USER_SET, user });
  }
};

const confirmGoToConnectionToRemoteServer =
  ({ navigation }) =>
  (dispatch) => {
    dispatch(
      ConfirmActions.show({
        confirmButtonTextKey: "settings:connectionToRemoteServer",
        messageKey: "settingsRemoteConnection:errorConnectingWithServer",
        titleKey: "authService:loginRequired",
        onConfirm: () =>
          navigation.navigate(screenKeys.settingsRemoteConnection),
      })
    );
  };

const login =
  ({ serverUrl, email, password, navigation = null, showBack = false }) =>
  async (dispatch) => {
    const res = await AuthService.login({ serverUrl, email, password });
    const { user, error, message } = res;
    if (user) {
      const settings = await SettingsService.fetchSettings();
      const settingsUpdated = { ...settings, serverUrl, email, password };
      await dispatch(SettingsActions.updateSettings(settingsUpdated));
      dispatch(
        ConfirmActions.show({
          titleKey: "authService:loginSuccessful",
          confirmButtonTextKey: "common:goBack",
          cancelButtonTextKey: "common:close",
          onConfirm: navigation.goBack,
        })
      );
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

const fetchLoggedInUserProfileIcon = async (dispatch, getState) => {
  if (__DEV__) console.log("fetching user profile icon");
  const state = getState();
  const user = RemoteConnectionSelectors.selectLoggedUser(state);
  if (!user) return;
  dispatch({
    type: USER_PROFILE_ICON_INFO_SET,
    payload: { loaded: false, loading: true, uri: null },
  });
  const uri = await AuthService.fetchUserPicture(user.uuid);
  dispatch({
    type: USER_PROFILE_ICON_INFO_SET,
    payload: { loaded: true, loading: false, uri },
  });
};

const _clearUserCredentialsInternal =
  ({ keepEmailAddress } = {}) =>
  async (dispatch) => {
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

const clearUserCredentials = () => async (dispatch) => {
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
  ({ keepEmailAddress }) =>
  async (dispatch) => {
    await AuthService.logout();
    dispatch(_clearUserCredentialsInternal({ keepEmailAddress }));
  };

const logout = () => (dispatch) => {
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
      onConfirm: ({ selectedMultipleChoiceValues }) =>
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
  USER_SET,
  USER_PROFILE_ICON_INFO_SET,
  confirmGoToConnectionToRemoteServer,
  checkLoggedIn,
  login,
  fetchLoggedInUserProfileIcon,
  clearUserCredentials,
  logout,
};
