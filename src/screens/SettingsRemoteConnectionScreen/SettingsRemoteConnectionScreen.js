import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import {
  Button,
  FieldSet,
  HView,
  Icon,
  Link,
  RadioButton,
  RadioButtonGroup,
  ScreenView,
  Spacer,
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
} from "state";
import { useIsNetworkConnected } from "hooks";
import styles from "./styles";

const forgotPasswordUrl =
  "https://www.openforis-arena.org/guest/forgotPassword";
const requestAccessUrl = "https://www.openforis-arena.org/guest/accessRequest";

const serverUrlTypes = {
  default: "default",
  custom: "custom",
};

export const SettingsRemoteConnectionScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const [state, setState] = useState({
    serverUrl: SettingsService.defaultServerUrl,
    serverUrlType: serverUrlTypes.default,
    serverUrlVerified: false,
    email: "",
    password: "",
  });

  const { email, password, serverUrl, serverUrlType, serverUrlVerified } =
    state;

  const initialize = useCallback(async () => {
    const settings = await SettingsService.fetchSettings();
    const serverUrlNext = settings.serverUrl
      ? settings.serverUrl
      : SettingsService.defaultServerUrl;

    const serverUrlTypeNext =
      serverUrlNext === SettingsService.defaultServerUrl
        ? serverUrlTypes.default
        : serverUrlTypes.custom;

    setState((statePrev) => ({
      ...statePrev,
      serverUrl: serverUrlNext,
      serverUrlType: serverUrlTypeNext,
      email: settings.email || "",
      password: settings.password || "",
    }));
  }, []);

  // initialize form on load and reset form on logout
  useEffect(() => {
    initialize();
  }, [initialize, user]);

  const onServerUrlTypeChange = useCallback(
    async (type) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrlType: type,
        serverUrl:
          type === serverUrlTypes.default
            ? SettingsService.defaultServerUrl
            : serverUrl,
        serverUrlVerified: false,
      })),
    [serverUrl]
  );

  const onServerUrlChange = useCallback(
    (serverUrlUpdated) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrl: serverUrlUpdated.trim(),
        serverUrlVerified: false,
      })),
    []
  );

  const onTestUrlPress = useCallback(async () => {
    const valid = await SettingsService.testServerUrl(serverUrl);
    setState((statePrev) => ({ ...statePrev, serverUrlVerified: valid }));
    if (!valid) {
      dispatch(
        MessageActions.setMessage({
          content: "settingsRemoteConnection:serverUrlNotValid",
        })
      );
    }
  }, [dispatch, serverUrl]);

  const onEmailChange = useCallback(
    (text) =>
      setState((statePrev) => ({
        ...statePrev,
        email: text,
      })),
    []
  );

  const onPasswordChange = useCallback(
    (text) => setState((statePrev) => ({ ...statePrev, password: text })),
    []
  );

  const onLogin = useCallback(() => {
    // normalize email
    const emailNew = email.trim().toLocaleLowerCase();
    setState((statePrev) => ({
      ...statePrev,
      email: emailNew,
    }));
    dispatch(
      RemoteConnectionActions.login({
        serverUrl,
        email: emailNew,
        password,
        navigation,
      })
    );
  }, [dispatch, email, navigation, password, serverUrl]);

  const onLogout = useCallback(async () => {
    if (networkAvailable) {
      dispatch(RemoteConnectionActions.logout());
    } else {
      dispatch(RemoteConnectionActions.clearUserCredentials());
    }
  }, [dispatch, networkAvailable]);

  return (
    <ScreenView>
      <VView style={styles.container}>
        {!networkAvailable && <Text textKey="common:networkNotAvailable" />}
        <FieldSet headerKey="settingsRemoteConnection:serverUrl">
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
          <HView>
            <TextInput
              disabled={
                serverUrlType === serverUrlTypes.default || !networkAvailable
              }
              onChange={onServerUrlChange}
              style={styles.serverUrlTextInput}
              value={serverUrl}
            />
            {serverUrlVerified && <Icon source="check" size={30} />}
          </HView>
          {!serverUrlVerified && (
            <Button
              disabled={!networkAvailable}
              style={styles.testUrlButton}
              textKey="settingsRemoteConnection:testUrl"
              onPress={onTestUrlPress}
            />
          )}
        </FieldSet>
        <TextInput
          autoCapitalize="none"
          disabled={!networkAvailable}
          keyboardType="email-address"
          label="settingsRemoteConnection:email"
          onChange={onEmailChange}
          value={email}
        />
        <TextInputPassword
          disabled={!networkAvailable}
          label="settingsRemoteConnection:password"
          onChange={onPasswordChange}
          value={password}
        />
        <HView fullWidth style={styles.loginButtonBar}>
          <HView fullFlex>
            <Button
              color="secondary"
              onPress={navigation.goBack}
              style={styles.goBackButton}
              textKey="common:goBack"
              labelVariant="bodySmall"
            />
          </HView>
          <Button
            disabled={!networkAvailable}
            labelStyle={styles.loginButtonLabel}
            onPress={onLogin}
            style={styles.loginButton}
            textKey="settingsRemoteConnection:login"
          />
          <Spacer />
        </HView>
        {user && (
          <Button
            mode="text"
            onPress={onLogout}
            style={styles.logoutButton}
            textKey={
              networkAvailable
                ? "settingsRemoteConnection:logout"
                : "settingsRemoteConnection:clearCredentials"
            }
          />
        )}
        <Link
          labelKey="settingsRemoteConnection:forgotPassword"
          url={forgotPasswordUrl}
        />
        <Link
          labelKey="settingsRemoteConnection:requestAccess"
          url={requestAccessUrl}
        />
      </VView>
    </ScreenView>
  );
};
