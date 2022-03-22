import {dataKeys} from './constants';

const initialState = {
  accessData: {
    [dataKeys.username]: '',
    [dataKeys.password]: '',
  },
  ui: {
    error: undefined,
    isLoading: false,
  },
};

export default initialState;
