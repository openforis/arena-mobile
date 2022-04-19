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
  },
};

export default initialState;
