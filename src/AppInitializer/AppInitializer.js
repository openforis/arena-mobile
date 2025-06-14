import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { DowngradeError, initialize as initializeDb } from "db";
import { AppLogo } from "appComponents/AppLogo";
import { Text, View, VView } from "components";
import {
  DataMigrationService,
  PreferencesService,
  SettingsService,
  SurveyService,
} from "service";
import {
  DeviceInfoActions,
  RemoteConnectionActions,
  SettingsActions,
  SurveyActions,
} from "state";
import { SystemUtils } from "utils";

import styles from "./styles";

// Crypto (for internal UUIDs generation)
import * as Crypto from "expo-crypto";
if (!global.crypto) {
  global.crypto = Crypto;
}

const steps = {
  starting: "starting",
  fetchingDeviceInfo: "fetchingDeviceInfo",
  fetchingSettings: "fetchingSettings",
  storingSettings: "storingSettings",
  settingFullScreen: "settingFullScreen",
  settingKeepScreenAwake: "settingKeepScreenAwake",
  startingGpsLocking: "startingGpsLocking",
  initializingDb: "initializingDb",
  startingDbMigrations: "startingDbMigrations",
  fetchingSurveys: "fetchingSurveys",
  importingDemoSurvey: "importingDemoSurvey",
  fetchingAndSettingLocalSurveys: "fetchingAndSettingLocalSurveys",
  fetchingAndSettingSurvey: "fetchingAndSettingSurvey",
  checkingLoggedIn: "checkingLoggedIn",
  complete: "complete",
};

export const AppInitializer = (props) => {
  const { children } = props;

  const dispatch = useDispatch();

  const [state, setState] = useState({
    loading: true,
    errorMessage: null,
    step: steps.starting,
  });
  const { loading, errorMessage, step } = state;

  const setStep = (stepNew) =>
    setState((statePrev) => ({ ...statePrev, step: stepNew }));

  const initialize = useCallback(async () => {
    if (__DEV__) {
      console.log("Initializing app");
    }
    setStep(steps.fetchingDeviceInfo);
    await dispatch(DeviceInfoActions.initDeviceInfo());

    setStep(steps.fetchingSettings);
    const settings = await SettingsService.fetchSettings();

    setStep(steps.storingSettings);
    await dispatch(SettingsActions.updateSettings(settings));

    if (settings.fullScreen) {
      setStep(steps.settingFullScreen);
      await SystemUtils.setFullScreen(settings.fullScreen);
    }
    if (settings.keepScreenAwake) {
      setStep(steps.settingKeepScreenAwake);
      await SystemUtils.setKeepScreenAwake(settings.keepScreenAwake);
    }
    if (settings.locationGpsLocked) {
      setStep(steps.startingGpsLocking);
      await dispatch(SettingsActions.startGpsLocking());
    }
    setStep(steps.initializingDb);
    const { dbMigrationsRun, prevDbVersion } = await initializeDb();

    if (dbMigrationsRun) {
      setStep(steps.startingDbMigrations);
      await DataMigrationService.migrateData({ prevDbVersion });
    }
    // initialize local surveys
    setStep(steps.fetchingSurveys);
    const surveySummaries = await SurveyService.fetchSurveySummariesLocal();
    if (surveySummaries.length === 0) {
      setStep(steps.importingDemoSurvey);
      await SurveyService.importDemoSurvey();
    }
    setStep(steps.fetchingAndSettingLocalSurveys);
    await dispatch(SurveyActions.fetchAndSetLocalSurveys());

    const currentSurveyId = await PreferencesService.getCurrentSurveyId();
    if (currentSurveyId) {
      setStep(steps.fetchingAndSettingSurvey);
      dispatch(
        SurveyActions.fetchAndSetCurrentSurvey({ surveyId: currentSurveyId })
      );
    }
    setStep(steps.checkingLoggedIn);
    dispatch(RemoteConnectionActions.checkLoggedIn());

    setStep(steps.complete);
    if (__DEV__) {
      console.log("App initialized");
    }
  }, [dispatch]);

  useEffect(() => {
    initialize()
      .then(() => {
        setState((statePrev) => ({ ...statePrev, loading: false }));
      })
      .catch((err) => {
        if (__DEV__) {
          console.error("===error", err);
        }
        const errorMessage =
          err instanceof DowngradeError
            ? "Downgrade error"
            : "Unexpected error: " + err;
        setState((statePrev) => ({
          ...statePrev,
          loading: false,
          errorMessage,
        }));
      });
  }, [dispatch, initialize]);

  if (loading) {
    return (
      <VView style={styles.container}>
        <AppLogo style={styles.logo} />
        <Text textKey={`app:initializationStep:${step}`} variant="labelSmall" />
        <Text textKey="app:pleaseWaitMessage" variant="labelLarge" />
      </VView>
    );
  }
  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text textKey={`Error: ${errorMessage}`} />
      </View>
    );
  }

  return children;
};

AppInitializer.propTypes = {
  children: PropTypes.node,
};
