import { Dictionary } from "@openforis/arena-core";

import { SystemUtils } from "utils/SystemUtils";

import { API } from "./api";
import { SettingsService } from "./settingsService";
import { AuthService } from "./authService";

// checked by the server to reject requests from app versions it doesn't support anymore
const appVersionHeader = "X-Arena-Mobile-App-Version";

const statusToErrorKey: Record<string, string> = {
  500: "internal_server_error",
  401: "invalid_credentials",
};

const handleError = ({ error }: any): { errorKey: string } => {
  if (error.response) {
    const status = error.response?.status;
    const errorKey = statusToErrorKey[status] || error.errorMessage;
    return { errorKey };
  } else {
    return { errorKey: "network_error" };
  }
};

const getServerUrl = async () =>
  (await SettingsService.fetchSettings()).serverUrl;

const attachHeaders = (config: Dictionary<any> = {}) => {
  const headers = {
    ...config?.headers,
    ...AuthService.generateAuthorizationHeaders(),
    [appVersionHeader]: SystemUtils.getRecordAppInfo().version,
  };
  return { ...config, headers };
};

const withRetry = async (
  callback: () => Promise<any>,
  maxRetries = 1,
): Promise<any> => {
  try {
    return await callback();
  } catch (error: any) {
    const status = Number(error?.response?.status);
    const isAuthRefreshRequest =
      error?.config?.url === AuthService.authTokenRefreshUrl;
    if (status === 401 && !isAuthRefreshRequest && maxRetries > 0) {
      try {
        await AuthService.refreshAuthTokens();
      } catch {
        // If refresh itself fails, propagate the original 401 error
        throw error;
      }
      // Retry the callback after successful token refresh
      return withRetry(callback, maxRetries - 1);
    }
    // Non-401 errors, refresh URL errors, or exhausted retries: propagate error
    throw error;
  }
};

const get = async (uri: string, data?: Dictionary<any>, config = {}) => {
  const serverUrl = await getServerUrl();
  const sendRequest = async () =>
    API.get({
      serverUrl,
      uri,
      data,
      config: attachHeaders(config),
    });
  return withRetry(sendRequest);
};

const getFile = async (uri: string, data?: Dictionary<any>) => {
  const serverUrl = await getServerUrl();
  const sendRequest = async () =>
    API.getFile({
      serverUrl,
      uri,
      data,
      config: attachHeaders(),
    });
  return withRetry(sendRequest);
};

const getFileOrThrow = async (uri: string, data?: Dictionary<any>) => {
  const serverUrl = await getServerUrl();
  const sendRequest = async () =>
    API.getFileOrThrow({
      serverUrl,
      uri,
      data,
      config: attachHeaders(),
    });
  return withRetry(sendRequest);
};

const post = async (uri: string, data?: Dictionary<any>) => {
  const serverUrl = await getServerUrl();
  const sendRequest = async () =>
    API.post({
      serverUrl,
      uri,
      data,
      config: attachHeaders(),
    });
  return withRetry(sendRequest);
};

const del = async (uri: string) => {
  const serverUrl = await getServerUrl();
  const sendRequest = async () =>
    API.del({
      serverUrl,
      uri,
      config: attachHeaders(),
    });
  return withRetry(sendRequest);
};

const postCancelableMultipartData = async (
  uri: string,
  data: Dictionary<any>,
  onUploadProgress: any,
) => {
  const serverUrl = await getServerUrl();
  const config = { onUploadProgress };
  let cancelCurrentRequest: () => void;
  const sendRequest = () => {
    const { promise, cancel } = API.postCancelableMultipartData({
      serverUrl,
      uri,
      data,
      config: attachHeaders(config),
    });
    cancelCurrentRequest = cancel;
    return promise;
  };
  return {
    promise: withRetry(sendRequest),
    cancel: () => cancelCurrentRequest(),
  };
};

const postMultipartData = async (
  uri: string,
  data: Dictionary<any>,
  onUploadProgress: any,
) => {
  const serverUrl = await getServerUrl();
  const config = { onUploadProgress };
  const sendRequest = async () =>
    API.postMultipartData({
      serverUrl,
      uri,
      data,
      config: attachHeaders(config),
    });
  return withRetry(sendRequest);
};

export const RemoteService = {
  getServerUrl,

  del,
  get,
  getFile,
  getFileOrThrow,
  post,
  postCancelableMultipartData,
  postMultipartData,
  handleError,
};
