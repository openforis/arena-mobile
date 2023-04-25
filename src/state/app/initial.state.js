import {dataKeys} from './constants';

const initialState = {
  accessData: {
    [dataKeys.username]: '',
    [dataKeys.password]: '',
  },
  preferences: {},
  ui: {
    serverError: false,
    credentialsError: false,
    isLoading: false,
    showNames: false,
    devMode: false,
    style: {
      baseModifier: 1,
      fontBaseModifier: 1,
    },
  },
};

export default initialState;
