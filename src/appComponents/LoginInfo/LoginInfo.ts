import { FieldSet, HView, Icon, LoadingIcon, Text, VView } from "components";
import { useIsNetworkConnected } from "hooks";
import { UserSummary } from "navigation/UserSummary";
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
    // @ts-expect-error TS(2749): 'LoadingIcon' refers to a value, but is being used... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2709): Cannot use namespace 'FieldSet' as a type.
    <FieldSet
      // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
      headerKey="loginInfo:notLoggedIn"
      // @ts-expect-error TS(7027): Unreachable code detected.
      style={styles.notLoggedInContainer}
    >
      // @ts-expect-error TS(2709): Cannot use namespace 'VView' as a type.
      <VView style={styles.notLoggedInInnerContainer}>
        {errorKey && (
          // @ts-expect-error TS(2709): Cannot use namespace 'HView' as a type.
          <HView style={styles.notLoggedInfoContainer}>
            // @ts-expect-error TS(2709): Cannot use namespace 'Icon' as a type.
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
