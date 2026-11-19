import { StyleSheet } from "react-native";

import { Button, Text, VView } from "components";
import { APIUtils } from "service/api/apiUtils";
import {
  ExternalLoginProvider,
  getExternalLoginProviderIconUri,
} from "service/externalLoginUtils";

const styles = StyleSheet.create({
  container: { alignSelf: "stretch", gap: 8 },
  orText: { alignSelf: "center" },
});

// Material Design icons of the provider presets
const iconByProviderType: Record<string, string> = {
  google: "google",
  microsoft: "microsoft",
};

const getProviderIcon = ({
  provider,
  serverUrl,
}: {
  provider: ExternalLoginProvider;
  serverUrl: string;
}) => {
  const builtinIcon = iconByProviderType[provider.type];
  if (builtinIcon) return builtinIcon;
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
  if (providers.length === 0) return null;
  return (
    <VView style={styles.container}>
      <Text style={styles.orText} textKey="settingsRemoteConnection:or" />
      {providers.map((provider) => (
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
      ))}
    </VView>
  );
};
