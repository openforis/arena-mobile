import React, { useCallback, useEffect, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { Objects } from "@openforis/arena-core";

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
import { SettingsService } from "service";
import {
  MessageActions,
  RemoteConnectionActions,
  RemoteConnectionSelectors,
  useAppDispatch,
} from "state";
import { useEffectiveTheme, useIsNetworkConnected } from "hooks";
import { AMConstants } from "utils";

import { LoggedInUserSummary } from "./LoggedInUserSummary";
import styles from "./styles";

const serverUrlTypes = {
  default: "default",
  custom: "custom",
};

const parseLoginQrCodeData = (data: string) => {
  try {
    const parsedData = JSON.parse(data);
    const { serverUrl, token } = parsedData;
    if (
      typeof serverUrl === "string" &&
      typeof token === "string" &&
      Objects.isNotEmpty(serverUrl) &&
      Objects.isNotEmpty(token)
    ) {
      return { serverUrl, token };
    }
  } catch {
    // ignore error
  }
  throw new Error("Invalid QR code data structure");
};

export const SettingsRemoteConnectionScreen = () => {
  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const { t } = useTranslation();
  const networkAvailable = useIsNetworkConnected();
  const theme = useEffectiveTheme();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const [state, setState] = useState({
    loading: false,
    serverUrl: AMConstants.defaultServerUrl,
    serverUrlType: serverUrlTypes.default,
    serverUrlVerified: false,
    email: "",
    password: "",
    qrScannerVisible: false,
  });

  const {
    loading,
    email,
    password,
    serverUrl,
    serverUrlType,
    serverUrlVerified,
    qrScannerVisible,
  } = state;

  const initialize = useCallback(async () => {
    const settings = await SettingsService.fetchSettings();
    const serverUrlNext = settings.serverUrl ?? AMConstants.defaultServerUrl;

    const serverUrlTypeNext =
      serverUrlNext === AMConstants.defaultServerUrl
        ? serverUrlTypes.default
        : serverUrlTypes.custom;

    setState((statePrev) => ({
      ...statePrev,
      serverUrl: serverUrlNext,
      serverUrlType: serverUrlTypeNext,
      email: settings.email ?? "",
      password: settings.password ?? "",
    }));
  }, []);

  // initialize form on load and reset form on logout
  useEffect(() => {
    initialize();
  }, [initialize, user]);

  const onServerUrlTypeChange = useCallback(
    (type: any) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrlType: type,
        serverUrl:
          type === serverUrlTypes.default
            ? AMConstants.defaultServerUrl
            : serverUrl,
        serverUrlVerified: false,
      })),
    [serverUrl],
  );

  const onServerUrlChange = useCallback(
    (serverUrlUpdated: any) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrl: serverUrlUpdated.trim(),
        serverUrlVerified: false,
      })),
    [],
  );

  const onTestUrlPress = useCallback(async () => {
    const valid = await SettingsService.testServerUrl(serverUrl);
    setState((statePrev) => ({ ...statePrev, serverUrlVerified: valid }));
    if (!valid) {
      dispatch(
        MessageActions.setMessage({
          content: "settingsRemoteConnection:serverUrlNotValid",
        }),
      );
    }
  }, [dispatch, serverUrl]);

  const onEmailChange = useCallback(
    (text: any) =>
      setState((statePrev) => ({
        ...statePrev,
        email: text,
      })),
    [],
  );

  const onPasswordChange = useCallback(
    (text: any) => setState((statePrev) => ({ ...statePrev, password: text })),
    [],
  );

  const onLogin = useCallback(async () => {
    // normalize email
    const emailNew = email.trim().toLocaleLowerCase();
    setState((statePrev) => ({
      ...statePrev,
      email: emailNew,
      loading: true,
    }));
    await dispatch(
      RemoteConnectionActions.login({
        serverUrl,
        email: emailNew,
        password,
        navigator,
        showBack: true,
      }),
    );
    setState((statePrev) => ({ ...statePrev, loading: false }));
  }, [dispatch, email, navigator, password, serverUrl]);

  const onScanQrCode = useCallback(() => {
    setState((statePrev) => ({ ...statePrev, qrScannerVisible: true }));
  }, []);

  const onQrScannerData = useCallback(
    async (data: string) => {
      setState((statePrev) => ({
        ...statePrev,
        qrScannerVisible: false,
        loading: true,
      }));
      await new Promise<void>((resolve) => setTimeout(resolve, 500)); // wait for modal to close

      try {
        const { serverUrl: serverUrlScanned, token } =
          parseLoginQrCodeData(data);
        await dispatch(
          RemoteConnectionActions.loginWithTempAuthToken({
            token,
            serverUrl: serverUrlScanned,
            navigator,
            showBack: true,
          }),
        );
      } catch {
        dispatch(
          MessageActions.setMessage({
            content: "settingsRemoteConnection:qrCodeNotValid",
          }),
        );
      } finally {
        setState((statePrev) => ({ ...statePrev, loading: false }));
      }
    },
    [dispatch, navigator],
  );

  const onQrScannerDismiss = useCallback(() => {
    setState((statePrev) => ({ ...statePrev, qrScannerVisible: false }));
  }, []);

  const onLogout = useCallback(() => {
    if (networkAvailable) {
      dispatch(RemoteConnectionActions.logout());
    } else {
      dispatch(RemoteConnectionActions.clearUserCredentials());
    }
  }, [dispatch, networkAvailable]);

  if (loading) {
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

  const loginDisabled =
    !networkAvailable ||
    Objects.isEmpty(email?.trim()) ||
    Objects.isEmpty(password);

  return (
    <ScreenView>
      <VView style={styles.container}>
        {!networkAvailable && (
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
        )}
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
            textKey="settingsRemoteConnection:login"
          />
        </HView>
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
          initiallyCollapsed={serverUrlType === serverUrlTypes.default}
        >
          <RadioButtonGroup
            onValueChange={onServerUrlTypeChange}
            value={serverUrlType}
          >
            <HView>
              {Object.values(serverUrlTypes).map((type) => (
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
                serverUrlType === serverUrlTypes.default || !networkAvailable
              }
              onChange={onServerUrlChange}
              style={styles.serverUrlTextInput}
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
        <Link
          labelKey="settingsRemoteConnection:requestAccess"
          style={styles.requestAccessLink}
          url={AMConstants.requestAccessUrl}
        />
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
