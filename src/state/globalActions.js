import {createActions} from 'redux-actions';

const RESET = 'global/RESET';

export const types = {
  RESET,
};
const {global} = createActions({
  [types.RESET]: () => ({}),
});

export default global;
