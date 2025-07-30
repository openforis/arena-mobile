import axios from "axios";

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

const _sendGet = (serverUrl, uri, params = {}, options = {}) => {
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, params });
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
  const { promise, cancel } = _sendRequest(
    APIUtils.getUrl({ serverUrl, uri }),
    {
      ...options,
      method: "post",
      data: params,
    }
  );

  return { promise, cancel };
};

const post = async (serverUrl, uri, params, options = {}) => {
  const { promise } = postCancelable(serverUrl, uri, params, options);

  const response = await promise;

  const { data } = response;

  return { data, response };
};

const postCancelableMultipartData = (serverUrl, uri, params, options = {}) =>
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
  post,
  postCancelableMultipartData,
  postMultipartData,
  test,
};
