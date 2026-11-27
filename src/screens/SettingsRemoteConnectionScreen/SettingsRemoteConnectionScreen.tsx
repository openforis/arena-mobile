import React from "react";
import { useNavigator } from "navigation/navigator";

import { TextInput as RNPTextInput } from "react-native-paper";

import { AppLogo } from "appComponents/AppLogo";
import {
  Button,
  Card,
  CollapsiblePanel,
  HView,
  Icon,
  Link,
  Loader,
  QrScannerModal,
  RadioButton,
  RadioButtonGroup,
  ScreenView,
  Text,
  TextInput,
  TextInputPassword,
  VView,
} from "components";
import { useTranslation } from "localization";
import { useEffectiveTheme } from "hooks";
import { AMConstants } from "utils";

import { ExternalLoginButtons } from "./ExternalLoginButtons";
import { LoggedInUserSummary } from "./LoggedInUserSummary";
import { CreateAccountBanner } from "./CreateAccountBanner";
import { ServerUrlType } from "./remoteConnectionUtils";
import { TwoFactorVerification } from "./TwoFactorVerification";
import { useSettingsRemoteConnection } from "./useSettingsRemoteConnection";
import styles from "./styles";

export const SettingsRemoteConnectionScreen = () => {
  const navigator = useNavigator();
  const { t } = useTranslation();
  const theme = useEffectiveTheme();

  const {
    loading,
    email,
    externalLoginEmail,
    externalLoginProviderLabel,
    externalLoginProviders,
    password,
    loginDisabled,
    networkAvailable,
    user,
    serverUrl,
    serverUrlType,
    serverUrlVerified,
    qrScannerVisible,
    twoFactorRequired,
    backupCodeMode,
    twoFactorCode,
    twoFactorCodeNotValid,
    onEmailChange,
    onPasswordChange,
    onExternalLogin,
    onLogin,
    onLogout,
    onServerUrlTypeChange,
    onServerUrlChange,
    onTestUrlPress,
    onScanQrCode,
    onQrScannerData,
    onQrScannerDismiss,
    onTwoFactorCodeChange,
    onTwoFactorVerify,
    onTwoFactorGoBack,
    onBackupCodeModeToggle,
  } = useSettingsRemoteConnection();

  // the two-step verification shows its own progress
  if (loading && !twoFactorRequired) {
    return <Loader />;
  }

  if (user && networkAvailable) {
    // logout is required before logging in again
    return (
      <ScreenView>
        <VView style={styles.container}>
          <LoggedInUserSummary
            email={email}
            onGoBack={navigator.goBack}
            onLogout={onLogout}
            serverUrl={serverUrl}
            user={user}
          />
        </VView>
      </ScreenView>
    );
  }

  const offlineBanner = !networkAvailable && (
    <HView
      style={[
        styles.offlineBanner,
        { backgroundColor: theme.colors.errorContainer },
      ]}
    >
      <Icon color={theme.colors.onErrorContainer} source="wifi-off" />
      <Text
        style={{ color: theme.colors.onErrorContainer }}
        textKey="common:networkNotAvailable"
      />
    </HView>
  );

  if (twoFactorRequired) {
    return (
      <ScreenView>
        <VView style={styles.container}>
          {offlineBanner}
          <TwoFactorVerification
            backupCodeMode={backupCodeMode}
            code={twoFactorCode}
            codeNotValid={twoFactorCodeNotValid}
            disabled={!networkAvailable}
            // the email typed in the form is not the account of an external sign-in
            email={
              externalLoginProviderLabel ? (externalLoginEmail ?? "") : email
            }
            externalLoginProvider={externalLoginProviderLabel}
            loading={loading}
            onBackupCodeModeToggle={onBackupCodeModeToggle}
            onCodeChange={onTwoFactorCodeChange}
            onGoBack={onTwoFactorGoBack}
            onVerify={onTwoFactorVerify}
          />
        </VView>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <VView style={styles.container}>
        {offlineBanner}
        <CreateAccountBanner />
        <Card contentStyle={styles.cardContent}>
          <AppLogo style={styles.logo} />
          <TextInput
            autoCapitalize="none"
            disabled={!networkAvailable}
            keyboardType="email-address"
            label="settingsRemoteConnection:email"
            left={<RNPTextInput.Icon icon="email-outline" />}
            onChange={onEmailChange}
            style={styles.textInput}
            value={email}
          />
          <TextInputPassword
            disabled={!networkAvailable}
            label="settingsRemoteConnection:password"
            left={<RNPTextInput.Icon icon="lock-outline" />}
            onChange={onPasswordChange}
            style={styles.textInput}
            value={password}
          />
          <Link
            labelKey="settingsRemoteConnection:forgotPassword"
            style={styles.forgotPasswordLink}
            url={AMConstants.forgotPasswordUrl}
          />
        </Card>
        <HView fullWidth style={styles.buttonBar}>
          <Button
            color="secondary"
            compact
            labelVariant="bodySmall"
            onPress={navigator.goBack}
            style={styles.goBackButton}
            textKey="common:goBack"
          />
          <Button
            disabled={loginDisabled}
            icon="login"
            labelStyle={styles.loginButtonLabel}
            onPress={onLogin}
            testID="remote-connection-login-button"
            textKey="settingsRemoteConnection:login"
          />
        </HView>
        <ExternalLoginButtons
          disabled={!networkAvailable}
          onPress={onExternalLogin}
          providers={externalLoginProviders}
          serverUrl={serverUrl}
        />
        <Button
          disabled={!networkAvailable}
          icon="qrcode-scan"
          mode="text"
          onPress={onScanQrCode}
          style={styles.centeredButton}
          textKey="settingsRemoteConnection:loginUsingQrCode"
        />
        <CollapsiblePanel
          headerKey="settingsRemoteConnection:serverUrl"
          initiallyCollapsed={serverUrlType === ServerUrlType.default}
        >
          <RadioButtonGroup
            onValueChange={onServerUrlTypeChange}
            value={serverUrlType}
          >
            <HView>
              {Object.values(ServerUrlType).map((type) => (
                <RadioButton
                  key={type}
                  disabled={!networkAvailable}
                  label={t(`settingsRemoteConnection:serverUrlType.${type}`)}
                  value={type}
                />
              ))}
            </HView>
          </RadioButtonGroup>
          <HView style={styles.serverUrlRow}>
            <TextInput
              disabled={
                serverUrlType === ServerUrlType.default || !networkAvailable
              }
              onChange={onServerUrlChange}
              style={styles.serverUrlTextInput}
              testID="remote-connection-server-url-input"
              value={serverUrl}
            />
            {serverUrlVerified && (
              <Icon
                color={theme.colors.primary}
                size={30}
                source="check-circle"
              />
            )}
          </HView>
          {!serverUrlVerified && (
            <Button
              disabled={!networkAvailable}
              mode="text"
              style={styles.centeredButton}
              textKey="settingsRemoteConnection:testUrl"
              onPress={onTestUrlPress}
            />
          )}
        </CollapsiblePanel>
        {user && (
          <Button
            icon="account-remove-outline"
            mode="text"
            onPress={onLogout}
            style={styles.centeredButton}
            textKey="settingsRemoteConnection:clearCredentials"
          />
        )}
      </VView>
      {qrScannerVisible && (
        <QrScannerModal
          onData={onQrScannerData}
          onDismiss={onQrScannerDismiss}
          titleKey="settingsRemoteConnection:scanQrCode"
        />
      )}
    </ScreenView>
  );
};
