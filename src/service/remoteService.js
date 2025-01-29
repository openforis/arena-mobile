import { API } from "./api";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";

const statusToErrorKey = {
  500: "internal_server_error",
  401: "invalid_credentials",
};

const multipartDataHeaders = { "Content-Type": "multipart/form-data" };

const handleError = ({ error }) => {
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

const get = async (uri, params) => API.get(await getServerUrl(), uri, params);

const getFile = async (uri, params, callback) => {
  const serverUrl = await getServerUrl();
  const authCookie =
    "connect.sid=" + (await SecureStoreService.getConnectSIDCookie());
  const options = { headers: { Cookie: authCookie } };
  return API.getFile({ serverUrl, uri, params, callback, options });
};

const post = async (uri, data) => API.post(await getServerUrl(), uri, data);

const postMultipartData = async (uri, data) =>
  API.post(await getServerUrl(), uri, data, {
    headers: multipartDataHeaders,
  });

export const RemoteService = {
  getServerUrl,

  get,
  getFile,
  post,
  postMultipartData,
  handleError,
};
