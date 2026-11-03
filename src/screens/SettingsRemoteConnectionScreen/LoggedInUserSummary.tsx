import { StyleSheet, View } from "react-native";

import { User } from "@openforis/arena-core";

import { Button, Card, Divider, HView, Icon, Text, VView } from "components";
import { useEffectiveTheme } from "hooks";
import { UserProfileIcon } from "navigation/UserProfileIcon";
import { AMConstants } from "utils";

const styles = StyleSheet.create({
  container: { gap: 20 },
  cardContent: { alignItems: "center", gap: 12, paddingVertical: 20 },
  name: { textAlign: "center" },
  divider: { alignSelf: "stretch" },
  infoRows: { alignSelf: "stretch", gap: 14 },
  infoRow: { alignItems: "center", gap: 14 },
  infoRowText: { flex: 1 },
  buttonBar: { alignItems: "center", justifyContent: "space-between" },
  goBackButton: { margin: 0, height: 40, width: 100 },
  logoutButtonLabel: { fontSize: 18 },
});

const InfoRow = ({
  icon,
  labelKey,
  value,
}: {
  icon: string;
  labelKey: string;
  value: string;
}) => {
  const theme = useEffectiveTheme();
  return (
    <HView style={styles.infoRow}>
      <Icon color={theme.colors.primary} size={24} source={icon} />
      <VView style={styles.infoRowText}>
        <Text
          style={{ color: theme.colors.onSurfaceVariant }}
          textKey={labelKey}
          variant="labelMedium"
        />
        <Text selectable variant="bodyLarge">
          {value}
        </Text>
      </VView>
    </HView>
  );
};

type Props = {
  email: string;
  onGoBack: () => void;
  onLogout: () => void;
  serverUrl: string;
  user: User;
};

export const LoggedInUserSummary = ({
  email,
  onGoBack,
  onLogout,
  serverUrl,
  user,
}: Props) => (
  <VView style={styles.container}>
    <Card contentStyle={styles.cardContent}>
      <UserProfileIcon size={80} />
      <Text
        style={styles.name}
        textKey="loginInfo:loggedInAs"
        textParams={{ name: user.name }}
        variant="titleLarge"
      />
      <View style={styles.divider}>
        <Divider />
      </View>
      <VView style={styles.infoRows}>
        <InfoRow
          icon="email-outline"
          labelKey="loginInfo:email"
          value={user.email ?? email}
        />
        {serverUrl !== AMConstants.defaultServerUrl && (
          <InfoRow
            icon="web"
            labelKey="loginInfo:serverUrl"
            value={serverUrl}
          />
        )}
      </VView>
    </Card>
    <HView fullWidth style={styles.buttonBar}>
      <Button
        color="secondary"
        compact
        labelVariant="bodySmall"
        onPress={onGoBack}
        style={styles.goBackButton}
        textKey="common:goBack"
      />
      <Button
        icon="logout"
        labelStyle={styles.logoutButtonLabel}
        onPress={onLogout}
        textKey="settingsRemoteConnection:logout"
      />
    </HView>
  </VView>
);
