import axios from "axios";

import { APIUtils } from "./apiUtils";

const defaultOptions = {
  credentials: "include",
  withCredentials: true,
  timeout: 40000, // 40 seconds
};

const errorMessageByCode = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
};

const multipartDataHeaders = { "Content-Type": "multipart/form-data" };

const _sendRequest = (url: any, opts = {}) => {
  const controller = new AbortController();
  const config = {
    ...defaultOptions,
    ...opts,
    url,
    signal: controller.signal,
  };
  return {
    promise: axios.request(config),
    cancel: () => controller.abort(),
  };
};

const _sendGet = (serverUrl: any, uri: any, params = {}, options = {}) => {
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, params });
  return _sendRequest(url, options);
};

const get = async (serverUrl: any, uri: any, params = {}, options = {}) => {
  const { promise } = _sendGet(serverUrl, uri, params, options);
  const response = await promise;
  const { status, data } = response;
  if (status === 200) {
    return { data };
  } else {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const errorMessage = errorMessageByCode[status] ?? errorMessageByCode[500];
    throw new Error(errorMessage);
  }
};

const getFileAsText = async (serverUrl: any, uri: any, params: any, options: any) => {
  const { promise } = _sendGet(serverUrl, uri, params, options);
  const response = await promise;
  return response.data;
};

const test = async (serverUrl: any, uri: any, params = {}) => {
  try {
    const { promise } = _sendGet(serverUrl, uri, params);
    const response = await promise;
    return response?.data?.status === "ok";
  } catch (e) {
    return false;
  }
};

const postCancelable = (serverUrl: any, uri: any, params: any, options = {}) => {
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

const post = async (serverUrl: any, uri: any, params: any, options = {}) => {
  const { promise } = postCancelable(serverUrl, uri, params, options);

  const response = await promise;

  const { data } = response;

  return { data, response };
};

const postCancelableMultipartData = (serverUrl: any, uri: any, params: any, options = {}) =>
  postCancelable(serverUrl, uri, APIUtils.objectToFormData(params), {
    headers: multipartDataHeaders,
    ...options,
  });

const postMultipartData = async (serverUrl: any, uri: any, params: any, options = {}) =>
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
