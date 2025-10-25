import { useContext } from "react";
import { useDispatch } from "react-redux";
import { NavigationContext } from "@react-navigation/native";

import { Button, HView, Text, VView } from "components";
import { screenKeys } from "screens/screenKeys";
import { SettingsService } from "service";
import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
  SettingsSelectors,
} from "state";

import { UserProfileIcon } from "./UserProfileIcon";

const styles = {
  container: { alignItems: "center", padding: 10, minWidth: 200 },
  innerContainer: { flex: 1 },
  button: {},
  text: { textAlign: "center", width: "100%" },
};

type UserSummaryProps = {
  navigation?: any,
  onButtonPress?: (() => void) | null,
  profileIconSize?: number, 
  showLogoutButton?: boolean,
  style?:any 
}

export const UserSummary = ({
  navigation: navigationProp = null,
  onButtonPress = null,
  profileIconSize = 60,
  showLogoutButton = true,
  style = null,
}: UserSummaryProps) => {
  const dispatch:any = useDispatch();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const settings = SettingsSelectors.useSettings();
  const { serverUrl } = settings;
  const navigation = (useContext(NavigationContext) ?? navigationProp)!;

  return (
    <HView style={[styles.container, style]} transparent>
      <UserProfileIcon
        onPress={() => {
          navigation.navigate(screenKeys.settingsRemoteConnection as never);
          onButtonPress?.();
        }}
        size={profileIconSize}
      />
      <VView style={styles.innerContainer} transparent>
        {serverUrl != SettingsService.defaultServerUrl && (
          <Text numberOfLines={1} style={styles.text}>
            {serverUrl}
          </Text>
        )}
        {user && (
          <Text
            numberOfLines={1}
            style={styles.text}
            textKey="loginInfo:welcomeMessage"
            textParams={{ name: user.name }}
          />
        )}
        {showLogoutButton && (
          <Button
            mode="text"
            textKey="loginInfo:logout"
            onPress={() => {
              dispatch(RemoteConnectionActions.logout());
              onButtonPress?.();
            }}
          />
        )}
      </VView>
    </HView>
  );
};
