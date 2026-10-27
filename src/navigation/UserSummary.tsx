import { useCallback, useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import { NavigationContext } from "@react-navigation/native";

import { Button, HView, Text, VView } from "components";
import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
  SettingsSelectors,
  useAppDispatch,
} from "state";
import { AMConstants } from "utils";

import { createNavigator, Navigator } from "./navigator";

import { UserProfileIcon } from "./UserProfileIcon";

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 10, minWidth: 200 },
  innerContainer: { flex: 1 },
  button: {},
  text: { textAlign: "center", width: "100%" },
});

type UserSummaryProps = {
  navigator?: Navigator | null;
  onButtonPress?: (() => void) | null;
  profileIconSize?: number;
  showLogoutButton?: boolean;
  style?: any;
};

export const UserSummary = ({
  navigator: navigatorProp = null,
  onButtonPress = null,
  profileIconSize = 60,
  showLogoutButton = true,
  style = null,
}: UserSummaryProps) => {
  const dispatch = useAppDispatch();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const settings = SettingsSelectors.useSettings();
  const { serverUrl } = settings;
  const navigationContext = useContext(NavigationContext);
  const navigator = useMemo(
    () =>
      navigationContext ? createNavigator(navigationContext) : navigatorProp!,
    [navigationContext, navigatorProp],
  );

  const onUserIconPress = useCallback(() => {
    navigator.navigateToSettingsRemoteConnection();
    onButtonPress?.();
  }, [navigator, onButtonPress]);

  const onLogoutPress = useCallback(() => {
    dispatch(RemoteConnectionActions.logout());
    onButtonPress?.();
  }, [dispatch, onButtonPress]);

  return (
    <HView style={[styles.container, style]}>
      <UserProfileIcon onPress={onUserIconPress} size={profileIconSize} />
      <VView style={styles.innerContainer}>
        {serverUrl != AMConstants.defaultServerUrl && (
          <Text numberOfLines={1} onPress={onUserIconPress} style={styles.text}>
            {serverUrl}
          </Text>
        )}
        {user && (
          <Text
            numberOfLines={1}
            onPress={onUserIconPress}
            style={styles.text}
            textKey="loginInfo:welcomeMessage"
            textParams={{ name: user.name }}
          />
        )}
        {showLogoutButton && (
          <Button
            mode="text"
            textKey="loginInfo:logout"
            onPress={onLogoutPress}
          />
        )}
      </VView>
    </HView>
  );
};
