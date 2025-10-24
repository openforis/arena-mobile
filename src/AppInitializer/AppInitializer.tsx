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
if (!globalThis.crypto) {
  globalThis.crypto = Crypto;
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

type AppInitializerState = {
  loading: boolean,
  errorMessage?: string | null,
  step: string,
}

export const AppInitializer = (props: any) => {
  const { children } = props;

  const dispatch = useDispatch();

  const [state, setState] = useState({
    loading: true,
    errorMessage: null,
    step: steps.starting,
  } as AppInitializerState);
  const { loading, errorMessage, step } = state;

  const setStep = (stepNew: any) => setState((statePrev) => ({ ...statePrev, step: stepNew }));

  const initialize = useCallback(async () => {
    if (__DEV__) {
      console.log("Initializing app");
    }
    await SystemUtils.cleanupTempFiles();

    setStep(steps.fetchingDeviceInfo);
    await dispatch(DeviceInfoActions.initDeviceInfo() as any);

    setStep(steps.fetchingSettings);
    const settings = await SettingsService.fetchSettings();

    setStep(steps.storingSettings);
    await dispatch(SettingsActions.updateSettings(settings) as any);

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
      await dispatch(SettingsActions.startGpsLocking() as any);
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
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
    await dispatch(SurveyActions.fetchAndSetLocalSurveys());

    const currentSurveyId = await PreferencesService.getCurrentSurveyId();
    if (currentSurveyId) {
      setStep(steps.fetchingAndSettingSurvey);
      dispatch(
        // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
        SurveyActions.fetchAndSetCurrentSurvey({ surveyId: currentSurveyId })
      );
    }
    setStep(steps.checkingLoggedIn);
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
    await dispatch(RemoteConnectionActions.loginAndSetUser());

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
