import axios from 'axios';

const SERVER_URL = 'https://2abd-213-177-210-99.ngrok.io';

const CONTENT_TYPES = {
  json: 'application/json',
  jpg: 'image/jpeg',
};

export default ({serverUrl = SERVER_URL}) => {
  const BASE_URL = serverUrl;
  console.log("API::serverUrl::", serverUrl)

  const fetchGeneric = async ({
    method,
    body,
    path,
    uri = false,
    contentType = '',
  }) =>
    axios(uri ? uri : `${BASE_URL}/${path}`, {
      method,
      ...(body ? {body: JSON.stringify(body)} : {}),
      ...(body ? {data: JSON.stringify(body)} : {}), // body in axios is params
      headers: {
        'Content-Type': contentType || CONTENT_TYPES.json,
      },
    });

  const get = async ({...params}) =>
    fetchGeneric({
      method: 'GET',
      ...params,
    });

  const patch = async ({...params}) =>
    fetchGeneric({
      method: 'PATCH',
      ...params,
    });

  const put = async ({...params}) =>
    fetchGeneric({
      method: 'PUT',
      ...params,
    });

  const post = async ({...params}) =>
    fetchGeneric({
      method: 'POST',
      ...params,
    });

  return {
    get,
    patch,
    put,
    post,
  };
};
