import axios, { AxiosRequestConfig } from "axios";

import { RequestOptions } from "./apiTypes";
import { APIUtils } from "./apiUtils";

const defaultConfig: AxiosRequestConfig = {
  withCredentials: true,
  timeout: 40000, // 40 seconds
};

const errorMessageByCode: Record<number, string> = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
};

const multipartDataHeaders = { "Content-Type": "multipart/form-data" };

const _sendRequest = (url: any, conf: AxiosRequestConfig = {}) => {
  const controller = new AbortController();
  const config: AxiosRequestConfig = {
    ...defaultConfig,
    ...conf,
    url,
    signal: controller.signal,
  };
  // add authorization header
  config.headers = {
    ...(config.headers ?? {}),
    // ...APIUtils.getAuthorizationHeaders(),
  };
  return {
    promise: axios.request(config),
    cancel: () => controller.abort(),
  };
};

const _sendGet = (options: RequestOptions) => {
  const url = APIUtils.getUrlWithParams(options);
  return _sendRequest(url, options);
};

const get = async (options: RequestOptions) => {
  const { promise } = _sendGet(options);
  const response = await promise;
  const { status, data } = response;
  if (status === 200) {
    return { data };
  } else {
    const errorMessage = errorMessageByCode[status] ?? errorMessageByCode[500];
    throw new Error(errorMessage);
  }
};

const getFileAsText = async (options: RequestOptions) => {
  const { promise } = _sendGet(options);
  const response = await promise;
  return response.data;
};

const test = async (options: RequestOptions) => {
  try {
    const { promise } = _sendGet(options);
    const response = await promise;
    return response?.data?.status === "ok";
  } catch (e) {
    return false;
  }
};

const postCancelable = (options: RequestOptions) => {
  const { serverUrl, uri, data } = options;
  const { promise, cancel } = _sendRequest(
    APIUtils.getUrl({ serverUrl, uri }),
    {
      ...options,
      method: "post",
      data,
    }
  );
  return { promise, cancel };
};

const post = async (options: RequestOptions) => {
  const { promise } = postCancelable(options);

  const response = await promise;

  const { data } = response;

  return { data, response };
};

const _prepareMultipartData = (options: RequestOptions): RequestOptions => {
  const { data, config: configParam } = options;

  const formData = APIUtils.objectToFormData(data);

  const axiosRequestOptions: AxiosRequestConfig = {
    headers: multipartDataHeaders, // Assuming this variable is defined elsewhere
    ...configParam,
  };
  return {
    ...options,
    data: formData,
    config: axiosRequestOptions,
  };
};

const postCancelableMultipartData = (options: RequestOptions) =>
  postCancelable(_prepareMultipartData(options));

const postMultipartData = async (options: RequestOptions) =>
  post(_prepareMultipartData(options));

export const APIAxios = {
  get,
  getFileAsText,
  post,
  postCancelableMultipartData,
  postMultipartData,
  test,
};
