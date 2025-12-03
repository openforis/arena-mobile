import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { RequestOptions } from "./apiTypes";
import { APIUtils } from "./apiUtils";

const defaultConfig: AxiosRequestConfig = {
  withCredentials: true,
  timeout: 40000, // 40 seconds
};

const multipartDataHeaders = { "Content-Type": "multipart/form-data" };

const _prepareRequest = (
  url: string,
  conf: AxiosRequestConfig = {}
): { promise: Promise<AxiosResponse>; cancel: () => void } => {
  const controller = new AbortController();
  const config: AxiosRequestConfig = {
    ...defaultConfig,
    ...conf,
    url,
    signal: controller.signal,
  };
  return {
    promise: axios.request(config),
    cancel: () => controller.abort(),
  };
};

const _prepareGet = (
  options: RequestOptions
): { promise: Promise<AxiosResponse>; cancel: () => void } => {
  const url = APIUtils.getUrlWithParams(options);
  const { config } = options;
  return _prepareRequest(url, config);
};

const get = async (options: RequestOptions): Promise<AxiosResponse> => {
  const { promise } = _prepareGet(options);
  return promise;
};

const getFileAsText = async (options: RequestOptions): Promise<any> => {
  const { data } = await get(options);
  return data;
};

const test = async (options: RequestOptions): Promise<boolean> => {
  try {
    const response = await get(options);
    return response?.data?.status === "ok";
  } catch (e) {
    return false;
  }
};

const postCancelable = (
  options: RequestOptions
): { promise: Promise<AxiosResponse>; cancel: () => void } => {
  const { serverUrl, uri, data, config } = options;
  const url = APIUtils.getUrl({ serverUrl, uri });
  const newConfig = { ...config, method: "post", data };
  const { promise, cancel } = _prepareRequest(url, newConfig);
  return { promise, cancel };
};

const post = async (
  options: RequestOptions
): Promise<{ data: any; response: AxiosResponse }> => {
  const { promise } = postCancelable(options);

  const response = await promise;

  const { data } = response;

  return { data, response };
};

const _prepareMultipartData = (options: RequestOptions): RequestOptions => {
  const { data, config: configParam } = options;

  const formData = APIUtils.objectToFormData(data);

  const axiosRequestOptions: AxiosRequestConfig = {
    headers: multipartDataHeaders,
    ...configParam,
  };
  return {
    ...options,
    data: formData,
    config: axiosRequestOptions,
  };
};

const postCancelableMultipartData = (
  options: RequestOptions
): { promise: Promise<AxiosResponse>; cancel: () => void } =>
  postCancelable(_prepareMultipartData(options));

const postMultipartData = async (
  options: RequestOptions
): Promise<{ data: any; response: AxiosResponse }> =>
  post(_prepareMultipartData(options));

export const APIAxios = {
  get,
  getFileAsText,
  post,
  postCancelableMultipartData,
  postMultipartData,
  test,
};
