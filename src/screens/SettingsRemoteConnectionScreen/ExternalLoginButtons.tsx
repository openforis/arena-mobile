import { StyleSheet } from "react-native";

import { Button, Text, VView } from "components";
import { useEffectiveTheme } from "hooks";
import { APIUtils } from "service/api/apiUtils";
import {
  ExternalLoginProvider,
  getExternalLoginProviderIconUri,
} from "service/externalLoginUtils";

import {
  BrandedSignInButton,
  isBrandedProviderType,
} from "./BrandedSignInButton";

const styles = StyleSheet.create({
  container: { alignSelf: "stretch", gap: 8 },
  centeredText: { alignSelf: "center", textAlign: "center" },
});

const getProviderIcon = ({
  provider,
  serverUrl,
}: {
  provider: ExternalLoginProvider;
  serverUrl: string;
}) => {
  if (provider.iconKind === "uploaded") {
    const uri = getExternalLoginProviderIconUri(provider.id);
    return { uri: APIUtils.getUrl({ serverUrl, uri }) };
  }
  return "login";
};

type Props = {
  disabled: boolean;
  onPress: (provider: ExternalLoginProvider) => void;
  providers: ExternalLoginProvider[];
  serverUrl: string;
};

export const ExternalLoginButtons = ({
  disabled,
  onPress,
  providers,
  serverUrl,
}: Props) => {
  const theme = useEffectiveTheme();
  if (providers.length === 0) return null;
  return (
    <VView style={styles.container}>
      <Text style={styles.centeredText} textKey="settingsRemoteConnection:or" />
      {providers.map((provider) =>
        isBrandedProviderType(provider.type) ? (
          <BrandedSignInButton
            key={provider.id}
            disabled={disabled}
            onPress={() => onPress(provider)}
            providerType={provider.type}
            testID={`remote-connection-external-login-${provider.id}`}
          />
        ) : (
          <Button
            key={provider.id}
            color="secondary"
            disabled={disabled}
            icon={getProviderIcon({ provider, serverUrl })}
            onPress={() => onPress(provider)}
            testID={`remote-connection-external-login-${provider.id}`}
            textKey="settingsRemoteConnection:signInWith"
            textParams={{ provider: provider.label }}
          />
        ),
      )}
      <Text
        style={[styles.centeredText, { color: theme.colors.onSurfaceVariant }]}
        textKey="settingsRemoteConnection:registeredUsersOnly"
        variant="bodySmall"
      />
    </VView>
  );
};
