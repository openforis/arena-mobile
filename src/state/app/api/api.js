import API from 'infra/api';

const pingServer = async ({serverUrl}) => {
  try {
    await API({serverUrl}).get({
      path: 'healthcheck',
    });

    return true;
  } catch (error) {
    console.log('Error ping', error);
    return false;
  }
};

const auth = async ({serverUrl, email, password}) => {
  try {
    const res = await API({serverUrl}).post({
      path: 'auth/login',
      body: {
        email,
        password,
      },
    });

    if (res.status === 204) {
      return true;
    }
    return res?.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      return {error: 'Unauthorized'};
    }

    return {error: 'BAD SERVER RESPONSE'};
  }
};

const appApi = {
  auth,
  pingServer,
};

export default appApi;
