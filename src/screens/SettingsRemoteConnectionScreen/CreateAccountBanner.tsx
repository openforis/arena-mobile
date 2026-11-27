import * as WebBrowser from "expo-web-browser";
import { StyleSheet } from "react-native";

import { Button, HView, Text, VView } from "components";
import { useEffectiveTheme } from "hooks";
import { AMConstants } from "utils";

const styles = StyleSheet.create({
  container: { alignItems: "center", borderRadius: 8, gap: 10, padding: 12 },
  textContainer: { flex: 1, gap: 2 },
  title: { fontWeight: "bold" },
});

const openCreateAccountPage = async () => {
  await WebBrowser.openBrowserAsync(AMConstants.createAccountUrl);
};

// shown first, so that new users create an account before trying to log in (e.g. with Google)
export const CreateAccountBanner = () => {
  const theme = useEffectiveTheme();
  const textStyle = { color: theme.colors.onSecondaryContainer };
  return (
    <HView
      style={[
        styles.container,
        { backgroundColor: theme.colors.secondaryContainer },
      ]}
      testID="remote-connection-create-account-banner"
    >
      <VView style={styles.textContainer}>
        <Text
          style={[styles.title, textStyle]}
          textKey="settingsRemoteConnection:newToArena"
        />
        <Text
          style={textStyle}
          textKey="settingsRemoteConnection:createAccountBeforeLoggingIn"
          variant="bodySmall"
        />
      </VView>
      <Button
        onPress={openCreateAccountPage}
        textKey="settingsRemoteConnection:createAccount"
      />
    </HView>
  );
};
