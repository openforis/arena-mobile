import axios from "axios";

import { Strings, UUIDs } from "@openforis/arena-core";

import { Files } from "utils";
import { APIUtils } from "./apiUtils";

const defaultOptions = {
  credentials: "include",
  withCreadentials: true,
};

const errorMessageByCode = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
};

const multipartDataHeaders = { "Content-Type": "multipart/form-data" };

const getUrl = ({ serverUrl, uri }) => {
  const parts = [];
  parts.push(Strings.removeSuffix("/")(serverUrl));
  parts.push(Strings.removePrefix("/")(uri));
  return parts.join("/");
};

const _sendRequest = (url, opts = {}, timeout = 120000) => {
  const controller = new AbortController();
  const config = {
    ...defaultOptions,
    ...opts,
    url,
    signal: controller.signal,
    timeout,
  };
  return {
    promise: axios.request(config),
    cancel: () => controller.abort(),
  };
};

const getUrlWithParams = ({ serverUrl, uri, params = {} }) => {
  const requestParams = Object.entries(params).reduce((acc, [key, value]) => {
    acc.append(key, value);
    return acc;
  }, new URLSearchParams());
  const requestParamsString = requestParams.toString();
  return (
    getUrl({ serverUrl, uri }) +
    (requestParamsString ? "?" + requestParamsString : "")
  );
};

const _sendGet = (serverUrl, uri, params = {}, options = {}) => {
  const url = getUrlWithParams({ serverUrl, uri, params });
  return _sendRequest(url, options, options?.timeout);
};

const get = async (serverUrl, uri, params = {}, options = {}) => {
  const { promise, cancel } = _sendGet(serverUrl, uri, params, options);
  const response = await promise;
  const { status, data } = response;
  if (status === 200) {
    return { data, cancel };
  } else {
    const errorMessage = errorMessageByCode[status] ?? errorMessageByCode[500];
    throw new Error(errorMessage);
  }
};

const getFileAsText = async (serverUrl, uri, params, options) => {
  const { promise } = _sendGet(serverUrl, uri, params, options);
  const response = await promise;
  return response.data;
};

const getFile = async ({
  serverUrl,
  uri,
  params,
  callback: _callback,
  targetFileUri = null,
  options = {},
}) => {
  const actualTargetFileUri =
    targetFileUri ?? Files.path(Files.cacheDirectory, UUIDs.v4() + ".tmp");
  const url = getUrlWithParams({ serverUrl, uri, params });
  await Files.download(url, actualTargetFileUri, options);
  return actualTargetFileUri;
};

const test = async (serverUrl, uri, params = {}) => {
  try {
    const { promise } = _sendGet(serverUrl, uri, params);
    const response = await promise;
    return response?.data?.status === "ok";
  } catch (e) {
    return false;
  }
};

const postCancelable = (serverUrl, uri, params, options = {}) => {
  const { promise, cancel } = _sendRequest(getUrl({ serverUrl, uri }), {
    ...options,
    method: "post",
    data: params,
  });

  return { promise, cancel };
};

const post = async (serverUrl, uri, params, options = {}) => {
  const { promise } = postCancelable(serverUrl, uri, params, options);

  const response = await promise;

  const { data } = response;

  return { data, response };
};

const postCancelableMultipartData = async (
  serverUrl,
  uri,
  params,
  options = {}
) =>
  postCancelable(serverUrl, uri, APIUtils.objectToFormData(params), {
    headers: multipartDataHeaders,
    ...options,
  });

const postMultipartData = async (serverUrl, uri, params, options = {}) =>
  post(serverUrl, uri, APIUtils.objectToFormData(params), {
    headers: multipartDataHeaders,
    ...options,
  });

export const APIAxios = {
  get,
  getFileAsText,
  getFile,
  post,
  postCancelableMultipartData,
  postMultipartData,
  test,
};
