import { Dictionary } from "@openforis/arena-core";

import { API } from "./api";
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

const get = async (uri: string, data?: Dictionary<any>, config = {}) =>
  API.get({ serverUrl: await getServerUrl(), uri, data, config });

const getFile = async (uri: string, data?: Dictionary<any>, callback?: any) =>
  API.getFile({ serverUrl: await getServerUrl(), uri, data, callback });

const post = async (uri: string, data?: Dictionary<any>) =>
  API.post({ serverUrl: await getServerUrl(), uri, data });

const postCancelableMultipartData = async (
  uri: string,
  data: Dictionary<any>,
  onUploadProgress: any
) =>
  API.postCancelableMultipartData({
    serverUrl: await getServerUrl(),
    uri,
    data,
    config: {
      onUploadProgress,
    },
  });

const postMultipartData = async (
  uri: string,
  data: Dictionary<any>,
  onUploadProgress: any
) =>
  API.postMultipartData({
    serverUrl: await getServerUrl(),
    uri,
    data,
    config: { onUploadProgress },
  });

export const RemoteService = {
  getServerUrl,

  get,
  getFile,
  post,
  postCancelableMultipartData,
  postMultipartData,
  handleError,
};
