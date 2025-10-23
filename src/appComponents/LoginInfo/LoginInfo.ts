// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { FieldSet, HView, Icon, LoadingIcon, Text, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useIsNetworkConnected } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'navigation/UserSummary' or its... Remove this comment to see the full error message
import { UserSummary } from "navigation/UserSummary";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { RemoteConnectionSelectors, SettingsSelectors } from "state";

import { ConnectionToRemoteServerButton } from "../ConnectionToRemoteServerButton";

import styles from "./styles";

const determineErrorKey = ({
  networkAvailable,
  credentialsSpecified
}: any) => {
  if (!networkAvailable) return "common:networkNotAvailable";
  if (!credentialsSpecified) return null;
  return "loginInfo:sessionExpired";
};

export const LoginInfo = () => {
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const userIsLoading = RemoteConnectionSelectors.useLoggedInUserIsLoading();
  const settings = SettingsSelectors.useSettings();
  const { email, password } = settings;

  if (userIsLoading) {
    return <LoadingIcon />;
  }
  if (user) {
    // @ts-expect-error TS(7027): Unreachable code detected.
    return <UserSummary style={styles.userSummary} />;
  }
  const credentialsSpecified = email && password;
  const errorKey = determineErrorKey({
    networkAvailable,
    credentialsSpecified,
  });

  return (
    <FieldSet
      // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
      headerKey="loginInfo:notLoggedIn"
      // @ts-expect-error TS(7027): Unreachable code detected.
      style={styles.notLoggedInContainer}
    >
      // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
      <VView style={styles.notLoggedInInnerContainer}>
        {errorKey && (
          // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
          <HView style={styles.notLoggedInfoContainer}>
            // @ts-expect-error TS(2304): Cannot find name 'source'.
            <Icon source="alert" />
            // @ts-expect-error TS(2304): Cannot find name 'textKey'.
            <Text textKey={errorKey} />
          </HView>
        )}
        // @ts-expect-error TS(2304): Cannot find name 'networkAvailable'.
        {networkAvailable && <ConnectionToRemoteServerButton />}
      </VView>
    </FieldSet>
  );
};
