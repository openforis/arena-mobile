import { Linking } from "react-native";
import { checkVersion } from "react-native-check-version";

import {
  AppCompatibilityOperation,
  AppCompatibilityService,
} from "service/appCompatibilityService";
import { log } from "utils";

import { ConfirmActions } from "../confirm";

const openAppStorePage = async () => {
  try {
    const { url } = (await checkVersion()) ?? {};
    if (url) {
      await Linking.openURL(url);
    }
  } catch (error) {
    log.warn(`error opening the app store page: ${String(error)}`);
  }
};

const showAppVersionNotSupportedDialog =
  ({ minVersion }: { minVersion?: string }) =>
  (dispatch: any) =>
    dispatch(
      ConfirmActions.show({
        titleKey: "app:appVersionNotSupported.title",
        messageKey: minVersion
          ? "app:appVersionNotSupported.message"
          : "app:appVersionNotSupported.messageWithoutMinVersion",
        messageParams: { minVersion },
        confirmButtonTextKey: "app:appVersionNotSupported.update",
        onConfirm: openAppStorePage,
      }),
    );

// true if the server supports the current app version for the operation; otherwise the user is asked to update the app
const checkAppVersionSupported =
  ({
    operation,
    silent = false,
  }: {
    operation: AppCompatibilityOperation;
    silent?: boolean;
  }) =>
  async (dispatch: any): Promise<boolean> => {
    const minVersion =
      await AppCompatibilityService.fetchMinAppVersionIfNotSupported({
        operation,
      });
    if (!minVersion) return true;

    if (silent) {
      log.warn(
        `app version not supported by the server for ${operation} (min version: ${minVersion})`,
      );
    } else {
      dispatch(showAppVersionNotSupportedDialog({ minVersion }));
    }
    return false;
  };

// shows the "app version not supported" dialog (returning true) if the error is the one returned by the server in that case
const handleAppVersionNotSupportedError =
  ({ error, silent = false }: { error: any; silent?: boolean }) =>
  (dispatch: any): boolean => {
    // unattended operations handle it as any other error
    if (
      silent ||
      !AppCompatibilityService.isAppVersionNotSupportedError(error)
    ) {
      return false;
    }
    const minVersion = AppCompatibilityService.getMinVersionFromError(error);
    dispatch(showAppVersionNotSupportedDialog({ minVersion }));
    return true;
  };

export const AppCompatibilityActions = {
  checkAppVersionSupported,
  handleAppVersionNotSupportedError,
};
