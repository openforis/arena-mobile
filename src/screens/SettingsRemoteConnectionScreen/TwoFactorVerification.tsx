import { StyleSheet } from "react-native";

import {
  Button,
  Card,
  HView,
  Icon,
  Text,
  TextInput,
  VerificationCodeInput,
} from "components";
import { useEffectiveTheme } from "hooks";
import { useTranslation } from "localization";

export const twoFactorCodeLength = 6;

const styles = StyleSheet.create({
  cardContent: { alignItems: "center", gap: 12, paddingVertical: 20 },
  centeredText: { textAlign: "center" },
  textInput: { alignSelf: "stretch" },
  buttonBar: { alignItems: "center", justifyContent: "space-between" },
  goBackButton: { margin: 0, height: 40, width: 100 },
  verifyButtonLabel: { fontSize: 18 },
  centeredButton: { alignSelf: "center" },
});

type Props = {
  backupCodeMode: boolean;
  code: string;
  codeNotValid: boolean;
  disabled: boolean;
  email: string;
  // set when signing in with an external provider: the code is still the one of the Arena account
  externalLoginProvider?: string | null;
  loading: boolean;
  onBackupCodeModeToggle: () => void;
  onCodeChange: (code: string) => void;
  onGoBack: () => void;
  onVerify: () => void;
};

export const TwoFactorVerification = ({
  backupCodeMode,
  code,
  codeNotValid,
  disabled,
  email,
  externalLoginProvider,
  loading,
  onBackupCodeModeToggle,
  onCodeChange,
  onGoBack,
  onVerify,
}: Props) => {
  const theme = useEffectiveTheme();
  const { t } = useTranslation();

  const codeComplete = backupCodeMode
    ? code.trim().length > 0
    : code.length === twoFactorCodeLength;
  const verifyEnabled = !disabled && !loading && codeComplete;

  return (
    <>
      <Card contentStyle={styles.cardContent}>
        <Icon
          color={theme.colors.primary}
          size={48}
          source="shield-lock-outline"
        />
        <Text
          style={styles.centeredText}
          textKey="settingsRemoteConnection:twoFactor.title"
          variant="titleLarge"
        />
        <Text
          selectable
          style={[
            styles.centeredText,
            { color: theme.colors.onSurfaceVariant },
          ]}
          variant="bodyMedium"
        >
          {externalLoginProvider
            ? t("settingsRemoteConnection:twoFactor.signedInWith", {
                provider: externalLoginProvider,
              })
            : email}
        </Text>
        {externalLoginProvider && (
          <Text
            style={styles.centeredText}
            textKey="settingsRemoteConnection:twoFactor.arenaAccountRequiresCode"
          />
        )}
        <Text
          style={styles.centeredText}
          textKey={
            backupCodeMode
              ? "settingsRemoteConnection:twoFactor.descriptionBackupCode"
              : "settingsRemoteConnection:twoFactor.description"
          }
        />
        {backupCodeMode ? (
          <TextInput
            autoCapitalize="characters"
            autoFocus
            disabled={disabled}
            error={codeNotValid}
            label="settingsRemoteConnection:twoFactor.backupCode"
            onChange={onCodeChange}
            onSubmitEditing={verifyEnabled ? onVerify : undefined}
            style={styles.textInput}
            testID="remote-connection-2fa-backup-code-input"
            value={code}
          />
        ) : (
          <VerificationCodeInput
            autoFocus
            error={codeNotValid}
            label="settingsRemoteConnection:twoFactor.code"
            length={twoFactorCodeLength}
            onChange={onCodeChange}
            testID="remote-connection-2fa-code-input"
            value={code}
          />
        )}
        {codeNotValid && (
          <Text
            style={[styles.centeredText, { color: theme.colors.error }]}
            textKey="authService:error.invalidTwoFactorCode"
          />
        )}
      </Card>
      <HView fullWidth style={styles.buttonBar}>
        <Button
          color="secondary"
          compact
          disabled={loading}
          labelVariant="bodySmall"
          onPress={onGoBack}
          style={styles.goBackButton}
          textKey="common:goBack"
        />
        <Button
          disabled={!verifyEnabled}
          icon="shield-check-outline"
          labelStyle={styles.verifyButtonLabel}
          loading={loading}
          onPress={onVerify}
          testID="remote-connection-2fa-verify-button"
          textKey="settingsRemoteConnection:twoFactor.verify"
        />
      </HView>
      <Button
        disabled={loading}
        mode="text"
        onPress={onBackupCodeModeToggle}
        style={styles.centeredButton}
        textKey={
          backupCodeMode
            ? "settingsRemoteConnection:twoFactor.useAuthenticatorApp"
            : "settingsRemoteConnection:twoFactor.useBackupCode"
        }
      />
    </>
  );
};
