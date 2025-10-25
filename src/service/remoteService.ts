import { API } from "./api";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";

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

const get = async (uri: any, params?: any, options = {}) =>
  API.get(await getServerUrl(), uri, params, options);

const getFile = async (uri: any, params?: any, callback?: any) => {
  const serverUrl = await getServerUrl();
  const authCookie =
    "connect.sid=" + (await SecureStoreService.getConnectSIDCookie());
  const options = { headers: { Cookie: authCookie } };
  return API.getFile({ serverUrl, uri, params, callback, options });
};

const post = async (uri: any, data?: any) =>
  API.post(await getServerUrl(), uri, data);

const postCancelableMultipartData = async (
  uri: any,
  data: any,
  onUploadProgress: any,
  options = {}
) =>
  API.postCancelableMultipartData(await getServerUrl(), uri, data, {
    ...options,
    onUploadProgress,
  });

const postMultipartData = async (uri: any, data: any, onUploadProgress: any) =>
  API.postMultipartData(await getServerUrl(), uri, data, { onUploadProgress });

export const RemoteService = {
  getServerUrl,

  get,
  getFile,
  post,
  postCancelableMultipartData,
  postMultipartData,
  handleError,
};
