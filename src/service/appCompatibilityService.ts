import { Versions } from "@openforis/arena-core";

import { log } from "utils/Logger";
import { SystemUtils } from "utils/SystemUtils";

import { RemoteService } from "./remoteService";

export enum AppCompatibilityOperation {
  recordsDownload = "recordsDownload",
  recordsUpload = "recordsUpload",
}

// props of the server version info (api/version) with the minimum app version supported for each operation
const minVersionPropByOperation: Record<AppCompatibilityOperation, string> = {
  [AppCompatibilityOperation.recordsDownload]:
    "minMobileAppVersionRecordsDownload",
  [AppCompatibilityOperation.recordsUpload]: "minMobileAppVersionRecordsUpload",
};

const appVersionNotSupportedStatusCode = 426;

const fetchMinAppVersion = async (
  operation: AppCompatibilityOperation,
): Promise<string | null> => {
  const { data } = await RemoteService.get("api/version");
  // not specified by servers released before the compatibility check
  return data?.[minVersionPropByOperation[operation]] ?? null;
};

// the minimum app version required by the server for the operation, if the current app version is lower; null otherwise
const fetchMinAppVersionIfNotSupported = async ({
  operation,
}: {
  operation: AppCompatibilityOperation;
}): Promise<string | null> => {
  try {
    const minVersion = await fetchMinAppVersion(operation);
    if (!minVersion) return null;
    const { version: appVersion } = SystemUtils.getRecordAppInfo();
    return Versions.isLessThan(appVersion, minVersion) ? minVersion : null;
  } catch (error) {
    // server errors are reported by the operation itself
    log.warn(`error checking app version compatibility: ${String(error)}`);
    return null;
  }
};

const isAppVersionNotSupportedError = (error: any): boolean =>
  (error?.status ?? error?.response?.status) ===
  appVersionNotSupportedStatusCode;

const getMinVersionFromError = (error: any): string | undefined =>
  error?.response?.data?.params?.minVersion;

export const AppCompatibilityService = {
  fetchMinAppVersionIfNotSupported,
  isAppVersionNotSupportedError,
  getMinVersionFromError,
};
