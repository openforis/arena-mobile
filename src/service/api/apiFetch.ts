import { APIUtils } from "./apiUtils";

const defaultOptions = {
  credentials: "include",
};

const errorMessageByCode = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
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

const _sendGet = async (serverUrl, uri, params = {}, options = {}) => {
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, params });
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

const test = async (serverUrl, uri, params = {}) => {
  try {
    const response = await _sendGet(serverUrl, uri, params);
    return response.ok;
  } catch (e) {
    return false;
  }
};

const post = async (serverUrl, uri, params, options = {}) => {
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
