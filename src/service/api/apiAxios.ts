import axios, { AxiosRequestConfig, AxiosResponse, isCancel } from "axios";

import { log } from "utils/Logger";

import { RequestOptions } from "./apiTypes";

type RequestOptionsWithFormData = Omit<RequestOptions, "data"> & {
  data?: RequestOptions["data"] | FormData;
};
import { APIUtils } from "./apiUtils";

const defaultConfig: AxiosRequestConfig = {
  withCredentials: true,
  timeout: 40000, // 40 seconds
};

const multipartDataHeaders = { "Content-Type": "multipart/form-data" };

// logged here, where the request details are still available: callers often wrap or stringify
// the error (e.g. "AxiosError: Network Error"), losing the url and the error code - which are
// what tell apart a request that never reached the server (no response: ERR_NETWORK,
// ECONNABORTED/timeout, ...) from one the server rejected (response status)
const _logRequestError = (config: AxiosRequestConfig, error: unknown) => {
  if (isCancel(error)) {
    log.debug(`API request canceled: ${config.method ?? "get"} ${config.url}`);
    return;
  }
  const { code, message, response } = (error ?? {}) as {
    code?: string;
    message?: string;
    response?: AxiosResponse;
  };
  const details = [
    `code: ${code ?? "-"}`,
    `message: ${message ?? error}`,
    response
      ? `response status: ${response.status}`
      : "no response received from the server",
  ];
  log.warn(
    `API request failed: ${config.method ?? "get"} ${config.url} (${details.join(", ")})`,
  );
};

const _prepareRequest = (
  url: string,
  conf: AxiosRequestConfig = {},
): { promise: Promise<AxiosResponse>; cancel: () => void } => {
  const controller = new AbortController();
  const config: AxiosRequestConfig = {
    ...defaultConfig,
    ...conf,
    url,
    signal: controller.signal,
  };
  return {
    promise: axios.request(config).catch((error) => {
      _logRequestError(config, error);
      throw error;
    }),
    cancel: () => controller.abort(),
  };
};

const _prepareGet = (
  options: RequestOptions,
): { promise: Promise<AxiosResponse>; cancel: () => void } => {
  const url = APIUtils.getUrlWithParams(options);
  const { config } = options;
  return _prepareRequest(url, config);
};

const get = async (options: RequestOptions): Promise<AxiosResponse> => {
  const { promise } = _prepareGet(options);
  return promise;
};

const getFileAsText = async (options: RequestOptions): Promise<string> => {
  const { data } = await get(options);
  return data;
};

const test = async (options: RequestOptions): Promise<boolean> => {
  try {
    const response = await get(options);
    return response?.data?.status === "ok";
  } catch {
    // server not reachable or not responding correctly
    return false;
  }
};

const postCancelable = (
  options: RequestOptionsWithFormData,
): { promise: Promise<AxiosResponse>; cancel: () => void } => {
  const { serverUrl, uri, data, config } = options;
  const url = APIUtils.getUrl({ serverUrl, uri });
  const newConfig = { ...config, method: "post", data };
  const { promise, cancel } = _prepareRequest(url, newConfig);
  return { promise, cancel };
};

const _withData = async (
  promise: Promise<AxiosResponse>,
): Promise<{ data: any; response: AxiosResponse }> => {
  const response = await promise;
  return { data: response.data, response };
};

const post = (options: RequestOptions) =>
  _withData(postCancelable(options).promise);

const del = (options: RequestOptions) => {
  const { serverUrl, uri, config } = options;
  const url = APIUtils.getUrl({ serverUrl, uri });
  return _withData(
    _prepareRequest(url, { ...config, method: "delete" }).promise,
  );
};

const _prepareMultipartDataOptions = (
  options: RequestOptions,
): RequestOptionsWithFormData => {
  const { data, config: configParam } = options;

  const formData = APIUtils.objectToFormData(data);

  const headers = { ...multipartDataHeaders, ...configParam?.headers };

  const axiosRequestOptions: AxiosRequestConfig = {
    ...configParam,
    headers,
  };
  return {
    ...options,
    data: formData,
    config: axiosRequestOptions,
  };
};

const postCancelableMultipartData = (
  options: RequestOptions,
): { promise: Promise<AxiosResponse>; cancel: () => void } =>
  postCancelable(_prepareMultipartDataOptions(options));

export const APIAxios = {
  del,
  get,
  getFileAsText,
  post,
  postCancelableMultipartData,
  test,
};
