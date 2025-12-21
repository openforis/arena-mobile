import { useCallback, useContext } from "react";
import { StyleSheet } from "react-native";
import { NavigationContext } from "@react-navigation/native";

import { Button, HView, Text, VView } from "components";
import { screenKeys } from "screens/screenKeys";
import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
  SettingsSelectors,
  useAppDispatch,
} from "state";
import { AMConstants } from "utils";

import { UserProfileIcon } from "./UserProfileIcon";

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 10, minWidth: 200 },
  innerContainer: { flex: 1 },
  button: {},
  text: { textAlign: "center", width: "100%" },
});

type UserSummaryProps = {
  navigation?: any;
  onButtonPress?: (() => void) | null;
  profileIconSize?: number;
  showLogoutButton?: boolean;
  style?: any;
};

export const UserSummary = ({
  navigation: navigationProp = null,
  onButtonPress = null,
  profileIconSize = 60,
  showLogoutButton = true,
  style = null,
}: UserSummaryProps) => {
  const dispatch = useAppDispatch();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const settings = SettingsSelectors.useSettings();
  const { serverUrl } = settings;
  const navigation = (useContext(NavigationContext) ?? navigationProp)!;

  const onUserIconPress = useCallback(() => {
    navigation.navigate(screenKeys.settingsRemoteConnection as never);
    onButtonPress?.();
  }, [navigation, onButtonPress]);

  const onLogoutPress = useCallback(() => {
    dispatch(RemoteConnectionActions.logout());
    onButtonPress?.();
  }, [dispatch, onButtonPress]);

  return (
    <HView style={[styles.container, style]} transparent>
      <UserProfileIcon onPress={onUserIconPress} size={profileIconSize} />
      <VView style={styles.innerContainer} transparent>
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
