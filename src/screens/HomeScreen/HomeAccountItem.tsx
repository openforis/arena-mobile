import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

import { Button, LoadingIcon } from "components";
import { useIsNetworkConnected } from "hooks";
import { RemoteConnectionSelectors, SettingsSelectors } from "state";

import { screenKeys } from "../screenKeys";
import { HomeListItem } from "./HomeListItem";

const determineNotLoggedInDescriptionKey = ({
  credentialsSpecified,
  networkAvailable,
}: {
  credentialsSpecified: boolean;
  networkAvailable: boolean;
}) => {
  if (!networkAvailable) return "common:networkNotAvailable";
  if (credentialsSpecified) return "loginInfo:sessionExpired";
  return "home:connectDescription";
};

export const HomeAccountItem = () => {
  const navigation = useNavigation();
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const userIsLoading = RemoteConnectionSelectors.useLoggedInUserIsLoading();
  const { email, password } = SettingsSelectors.useSettings();

  const onPress = useCallback(
    () => navigation.navigate(screenKeys.settingsRemoteConnection as never),
    [navigation],
  );

  if (userIsLoading) {
    return (
      <HomeListItem
        icon="account-outline"
        right={<LoadingIcon />}
        titleKey="loginInfo:login"
      />
    );
  }
  if (user) {
    return (
      <HomeListItem
        description={user.email}
        icon="account"
        onPress={onPress}
        title={user.name}
      />
    );
  }
  return (
    <HomeListItem
      descriptionKey={determineNotLoggedInDescriptionKey({
        credentialsSpecified: !!(email && password),
        networkAvailable,
      })}
      icon="account-off-outline"
      right={
        networkAvailable ? (
          <Button
            compact
            onPress={onPress}
            testID="home-connect-button"
            textKey="home:connect"
          />
        ) : undefined
      }
      titleKey="loginInfo:notLoggedIn"
    />
  );
};
