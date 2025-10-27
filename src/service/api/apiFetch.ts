import { APIUtils } from "./apiUtils";

const defaultRequestInit: RequestInit = {
  credentials: "include",
};

const errorMessageByCode: Record<number, string> = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
};

const fetchWithTimeout = async (url: any, opts = {}, timeout = 120000) => {
  const options = { ...defaultRequestInit, ...opts };
  const controller = new AbortController();
  const signal = controller.signal;
  const abortTimeoutId = setTimeout(() => controller.abort(), timeout);

  const requestInit = { ...options, signal };
  const result = await fetch(url, requestInit);

  clearTimeout(abortTimeoutId);

  return result;
};

const _sendGet = async (
  serverUrl: any,
  uri: any,
  params: any = {},
  options: any = {}
) => {
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, params });
  return fetchWithTimeout(url, options, options?.timeout);
};

const get = async (serverUrl: any, uri: any, params = {}, options = {}) => {
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

const getFileAsBlob = async (
  serverUrl: any,
  uri: any,
  params: any,
  options: any
) => {
  const response = await _sendGet(serverUrl, uri, params, options);
  return response.blob();
};

const getFileAsText = async (
  serverUrl: any,
  uri: any,
  params: any,
  options: any
) => {
  const blob = await getFileAsBlob(serverUrl, uri, params, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error as Error);
    reader.readAsText(blob);
  });
};

const test = async (serverUrl: any, uri: any, params = {}) => {
  try {
    const response = await _sendGet(serverUrl, uri, params);
    return response.ok;
  } catch (e) {
    return false;
  }
};

const post = async (serverUrl: any, uri: any, params: any, options = {}) => {
  const formData = APIUtils.objectToFormData(params);

  const response = await fetchWithTimeout(APIUtils.getUrl({ serverUrl, uri }), {
    ...options,
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  return { data, response };
};

export const APIFetch = {
  get,
  getFileAsBlob,
  getFileAsText,
  post,
  test,
};
