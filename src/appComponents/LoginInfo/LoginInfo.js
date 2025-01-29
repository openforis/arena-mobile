import { FieldSet, HView, Icon, Text, VView } from "components";
import { useIsNetworkConnected } from "hooks";
import { UserSummary } from "navigation/UserSummary";
import { RemoteConnectionSelectors, SettingsSelectors } from "state";

import { ConnectionToRemoteServerButton } from "../ConnectionToRemoteServerButton";

import styles from "./styles";

const determineErrorKey = ({ networkAvailable, credentialsSpecified }) => {
  if (!networkAvailable) return "common:networkNotAvailable";
  if (!credentialsSpecified) return null;
  return "loginInfo:sessionExpired";
};

export const LoginInfo = () => {
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const settings = SettingsSelectors.useSettings();
  const { email, password } = settings;

  if (user) {
    return <UserSummary style={styles.userSummary} />;
  }
  const credentialsSpecified = email && password;
  const errorKey = determineErrorKey({
    networkAvailable,
    credentialsSpecified,
  });

  return (
    <FieldSet
      headerKey="loginInfo:notLoggedIn"
      style={styles.notLoggedInContainer}
    >
      <VView style={styles.notLoggedInInnerContainer}>
        {errorKey && (
          <HView style={styles.notLoggedInfoContainer}>
            <Icon source="alert" />
            <Text textKey={errorKey} />
          </HView>
        )}
        {networkAvailable && <ConnectionToRemoteServerButton />}
      </VView>
    </FieldSet>
  );
};
