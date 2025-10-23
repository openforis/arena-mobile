import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'db' or its corresponding type ... Remove this comment to see the full error message
import { DowngradeError, initialize as initializeDb } from "db";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/AppLogo' or its ... Remove this comment to see the full error message
import { AppLogo } from "appComponents/AppLogo";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text, View, VView } from "components";
import {
  DataMigrationService,
  PreferencesService,
  SettingsService,
  SurveyService,
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
} from "service";
import {
  DeviceInfoActions,
  RemoteConnectionActions,
  SettingsActions,
  SurveyActions,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
} from "state";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { SystemUtils } from "utils";

import styles from "./styles";

// Crypto (for internal UUIDs generation)
import * as Crypto from "expo-crypto";
// @ts-expect-error TS(2304): Cannot find name 'global'.
if (!global.crypto) {
  // @ts-expect-error TS(2304): Cannot find name 'global'.
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

export const AppInitializer = (props: any) => {
  const { children } = props;

  const dispatch = useDispatch();

  const [state, setState] = useState({
    loading: true,
    errorMessage: null,
    step: steps.starting,
  });
  const { loading, errorMessage, step } = state;

  const setStep = (stepNew: any) => setState((statePrev) => ({ ...statePrev, step: stepNew }));

  const initialize = useCallback(async () => {
    if (__DEV__) {
      console.log("Initializing app");
    }
    await SystemUtils.cleanupTempFiles();

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
        // @ts-expect-error TS(2345): Argument of type '(statePrev: { loading: boolean; ... Remove this comment to see the full error message
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
