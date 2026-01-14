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

const withRetry = async (callback: () => Promise<any>): Promise<any> => {
  try {
    const result = await callback();
    return result;
  } catch (error: any) {
    if (
      Number(error?.response?.status) === 401 &&
      error?.config?.url !== AuthService.authTokenRefreshUrl
    ) {
      await AuthService.refreshAuthTokens();
      const resultRetried = await callback();
      return resultRetried;
    }
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
  onUploadProgress: any
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
  onUploadProgress: any
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
