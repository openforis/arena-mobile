import {dataKeys} from './constants';

const initialState = {
  accessData: {
    [dataKeys.username]: '',
    [dataKeys.password]: '',
  },
  preferences: {},
  ui: {
    error: false,
    isLoading: false,
    showNames: false,
    devMode: false,
  },
};

export default initialState;
