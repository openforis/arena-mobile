import { useContext } from "react";
import { useDispatch } from "react-redux";
import { NavigationContext } from "@react-navigation/native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

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

export const UserSummary = ({
  navigation: navigationProp = null,
  onButtonPress = null,
  profileIconSize = 60,
  showLogoutButton = true,
  style = null,
}) => {
  const dispatch = useDispatch();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const settings = SettingsSelectors.useSettings();
  const { serverUrl } = settings;
  const navigation = useContext(NavigationContext) ?? navigationProp;

  return (
    <HView style={[styles.container, style]} transparent>
      <UserProfileIcon
        onPress={() => {
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          navigation.navigate(screenKeys.settingsRemoteConnection);
          // @ts-expect-error TS(2349): This expression is not callable.
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
            // @ts-expect-error TS(2339): Property 'logoutButton' does not exist on type '{ ... Remove this comment to see the full error message
            style={styles.logoutButton}
            textKey="loginInfo:logout"
            onPress={() => {
              // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => void' is not ... Remove this comment to see the full error message
              dispatch(RemoteConnectionActions.logout());
              // @ts-expect-error TS(2349): This expression is not callable.
              onButtonPress?.();
            }}
          />
        )}
      </VView>
    </HView>
  );
};

UserSummary.propTypes = {
  navigation: PropTypes.object,
  onButtonPress: PropTypes.func,
  profileIconSize: PropTypes.number,
  showLogoutButton: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
