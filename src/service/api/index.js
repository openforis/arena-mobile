import { Strings, UUIDs } from "@openforis/arena-core";

import { Files } from "utils";

const defaultOptions = {
  credentials: "include",
};

const errorMessageByCode = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
};

const getUrl = ({ serverUrl, uri }) => {
  const parts = [];
  parts.push(Strings.removeSuffix("/")(serverUrl));
  parts.push(Strings.removePrefix("/")(uri));
  return parts.join("/");
};

const fetchWithTimeout = async (url, opts = {}, timeout = 120000) => {
  const options = { ...defaultOptions, ...opts };
  const controller = new AbortController();
  const signal = controller.signal;
  const abortTimeoutId = setTimeout(() => controller.abort(), timeout);

  const result = await fetch(url, { ...options, signal });

  clearTimeout(abortTimeoutId);

  return result;
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

const _sendGet = async (serverUrl, uri, params = {}, options = {}) => {
  const url = getUrlWithParams({ serverUrl, uri, params });
  return fetchWithTimeout(url, options, options?.timeout);
};

const get = async (serverUrl, uri, params = {}, options = {}) => {
  const response = await _sendGet(serverUrl, uri, params, options);
  if (response.status === 200) {
    const data = await response.json();
    return { data };
  } else {
    const errorMessage =
      errorMessageByCode[response.status] ?? errorMessageByCode[500];
    throw new Error(errorMessage);
  }
};

const getFileAsBlob = async (serverUrl, uri, params, options) => {
  const response = await _sendGet(serverUrl, uri, params, options);
  return response.blob();
};

const getFileAsText = async (serverUrl, uri, params, options) => {
  const blob = await getFileAsBlob(serverUrl, uri, params, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onError = () => reject(reader.error);
    reader.readAsText(blob);
  });
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
    targetFileUri ?? Files.path(Files.documentDirectory, UUIDs.v4() + ".zip");
  const url = getUrlWithParams({ serverUrl, uri, params });
  await Files.download(url, actualTargetFileUri, options);
  return actualTargetFileUri;
};

const test = async (serverUrl, uri, params = {}) => {
  try {
    const response = await _sendGet(serverUrl, uri, params);
    return response.ok;
  } catch (e) {
    return false;
  }
};

const post = async (serverUrl, uri, params, options = {}) => {
  const formData = Object.entries(params).reduce((acc, [key, value]) => {
    const formDataValue = Array.isArray(value) ? JSON.stringify(value) : value;
    acc.append(key, formDataValue);
    return acc;
  }, new FormData());

  const response = await fetchWithTimeout(getUrl({ serverUrl, uri }), {
    ...options,
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  return { data, response };
};

export const API = {
  get,
  getFileAsBlob,
  getFileAsText,
  getFile,
  post,
  test,
};
