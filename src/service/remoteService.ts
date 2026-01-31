import { Dictionary } from "@openforis/arena-core";

import { API } from "./api";
import { SettingsService } from "./settingsService";
import { AuthService } from "./authService";

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

const attachAuthenticationHeaders = (config: Dictionary<any> = {}) => {
  const headers = {
    ...config?.headers,
    ...AuthService.generateAuthorizationHeaders(),
  };
  return { ...config, headers };
};

const withRetry = async (
  callback: () => Promise<any>,
  maxRetries = 1,
): Promise<any> => {
  let attempt = 0;
  while (true) {
    try {
      const result = await callback();
      return result;
    } catch (error: any) {
      const status = Number(error?.response?.status);
      const isAuthRefreshRequest =
        error?.config?.url === AuthService.authTokenRefreshUrl;
      if (status === 401 && !isAuthRefreshRequest && attempt < maxRetries) {
        attempt += 1;
        try {
          await AuthService.refreshAuthTokens();
        } catch {
          // If refresh itself fails, propagate the original 401 error
          throw error;
        }
        // Retry the callback after successful token refresh
        continue;
      }
      // Non-401 errors, refresh URL errors, or exhausted retries: propagate error
      throw error;
    }
  }
};

const get = async (uri: string, data?: Dictionary<any>, config = {}) => {
  const serverUrl = await getServerUrl();
  const sendRequest = async () =>
    API.get({
      serverUrl,
      uri,
      data,
      config: attachAuthenticationHeaders(config),
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
      config: attachAuthenticationHeaders(),
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
      config: attachAuthenticationHeaders(),
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
  const sendRequest = async () =>
    API.postCancelableMultipartData({
      serverUrl,
      uri,
      data,
      config: attachAuthenticationHeaders(config),
    });
  return withRetry(sendRequest);
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
      config: attachAuthenticationHeaders(config),
    });
  return withRetry(sendRequest);
};

export const RemoteService = {
  getServerUrl,

  get,
  getFile,
  post,
  postCancelableMultipartData,
  postMultipartData,
  handleError,
};
