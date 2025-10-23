import { APIUtils } from "./apiUtils";

const defaultOptions = {
  credentials: "include",
};

const errorMessageByCode = {
  401: "User not authorized",
  403: "Forbidden",
  500: "Internal server error",
};

const fetchWithTimeout = async (url: any, opts = {}, timeout = 120000) => {
  const options = { ...defaultOptions, ...opts };
  const controller = new AbortController();
  const signal = controller.signal;
  const abortTimeoutId = setTimeout(() => controller.abort(), timeout);

  // @ts-expect-error TS(2345): Argument of type '{ signal: AbortSignal; credentia... Remove this comment to see the full error message
  const result = await fetch(url, { ...options, signal });

  clearTimeout(abortTimeoutId);

  return result;
};

const _sendGet = async (serverUrl: any, uri: any, params = {}, options = {}) => {
  const url = APIUtils.getUrlWithParams({ serverUrl, uri, params });
  // @ts-expect-error TS(2339): Property 'timeout' does not exist on type '{}'.
  return fetchWithTimeout(url, options, options?.timeout);
};

const get = async (serverUrl: any, uri: any, params = {}, options = {}) => {
  const response = await _sendGet(serverUrl, uri, params, options);
  if (response.status === 200) {
    const data = await response.json();
    return { data };
  } else {
    const errorMessage =
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      errorMessageByCode[response.status] ?? errorMessageByCode[500];
    throw new Error(errorMessage);
  }
};

const getFileAsBlob = async (serverUrl: any, uri: any, params: any, options: any) => {
  const response = await _sendGet(serverUrl, uri, params, options);
  return response.blob();
};

const getFileAsText = async (serverUrl: any, uri: any, params: any, options: any) => {
  const blob = await getFileAsBlob(serverUrl, uri, params, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    // @ts-expect-error TS(2551): Property 'onError' does not exist on type 'FileRea... Remove this comment to see the full error message
    reader.onError = () => reject(reader.error);
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
