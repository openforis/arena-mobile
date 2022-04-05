import API from 'infra/api';

const getSurvey = async ({serverUrl, email, password}) => {
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
    return res.json();
  } catch (error) {
    console.log('Error::appApi:auth', {error});
    return false;
  }
};

const appApi = {
  getSurvey,
};

export default appApi;
