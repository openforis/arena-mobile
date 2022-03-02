import {dataKeys} from './constants';

const initialState = {
  accessData: {
    [dataKeys.username]: '',
    [dataKeys.password]: '',
  },
  ui: {
    error: undefined,
    loading: false,
  },
};

export default initialState;
