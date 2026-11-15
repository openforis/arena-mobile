import { Dictionary } from "@openforis/arena-core";
import { CanceledError } from "axios";

import { HttpErrors } from "utils/HttpErrors";
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
    // the token refresh request doesn't go through here (see AuthService)
    if (HttpErrors.isUnauthorizedResponse(error) && maxRetries > 0) {
      try {
        await AuthService.refreshAuthTokens();
      } catch {
        // If refresh itself fails, propagate the original 401 error
        throw error;
      }
      // Retry the callback after successful token refresh
      return withRetry(callback, maxRetries - 1);
    }
    // Non-401 errors or exhausted retries: propagate error
    throw error;
  }
};

type ApiRequestOptions = {
  serverUrl: string;
  uri: string;
  data?: Dictionary<any>;
  // axios config or download options, depending on the request
  config?: any;
};

// headers are attached on every attempt: a retry must use the refreshed token
const sendRequest = async (
  apiRequest: (options: ApiRequestOptions) => Promise<any>,
  { uri, data, config }: Omit<ApiRequestOptions, "serverUrl">,
) => {
  const serverUrl = await getServerUrl();
  return withRetry(() =>
    apiRequest({ serverUrl, uri, data, config: attachHeaders(config) }),
  );
};

const get = (uri: string, data?: Dictionary<any>, config = {}) =>
  sendRequest(API.get, { uri, data, config });

const getFileOrThrow = (uri: string, data?: Dictionary<any>) =>
  sendRequest(API.getFileOrThrow, { uri, data });

const post = (uri: string, data?: Dictionary<any>) =>
  sendRequest(API.post, { uri, data });

const del = (uri: string) => sendRequest(API.del, { uri });

const postCancelableMultipartData = async (
  uri: string,
  data: Dictionary<any>,
  onUploadProgress: any,
) => {
  const serverUrl = await getServerUrl();
  // no timeout: a chunk can take long on weak connections, cancel() stops it
  const config = { onUploadProgress, timeout: 0 };
  let cancelCurrentRequest: () => void;
  let canceled = false;
  const sendRequest = async () => {
    // canceled while the token was being refreshed
    if (canceled) throw new CanceledError();
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
    cancel: () => {
      canceled = true;
      cancelCurrentRequest();
    },
  };
};

export const RemoteService = {
  getServerUrl,

  del,
  get,
  getFileOrThrow,
  post,
  postCancelableMultipartData,
  handleError,
};
