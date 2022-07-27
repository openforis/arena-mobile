import axios from 'axios';

const SERVER_URL = 'https://2abd-213-177-210-99.ngrok.io';

const CONTENT_TYPES = {
  json: 'application/json',
  jpg: 'image/jpeg',
};

export default ({serverUrl = SERVER_URL}) => {
  const BASE_URL = serverUrl;

  const fetchGeneric = async ({
    method,
    body,
    params,
    path,
    uri = false,
    contentType = '',
  }) =>
    axios(uri ? uri : `${BASE_URL}/${path}`, {
      method,
      ...(body ? {body: JSON.stringify(body)} : {}),
      ...(body ? {data: JSON.stringify(body)} : {}),
      ...(params ? {params: JSON.stringify(params)} : {}),
      headers: {
        'Content-Type': contentType || CONTENT_TYPES.json,
      },
    });

  const get = async ({body, path, uri, contentType, params}) =>
    fetchGeneric({
      method: 'GET',
      body,
      path,
      uri,
      contentType,
      params,
    });

  const patch = async ({body, path, uri, contentType}) =>
    fetchGeneric({
      method: 'PATCH',
      body,
      path,
      uri,
      contentType,
    });

  const put = async ({body, path, uri, contentType}) =>
    fetchGeneric({
      method: 'PUT',
      body,
      path,
      uri,
      contentType,
    });

  const post = async ({body, path, uri, contentType}) =>
    fetchGeneric({
      method: 'POST',
      body,
      path,
      uri,
      contentType,
    });

  return {
    get,
    patch,
    put,
    post,
  };
};
