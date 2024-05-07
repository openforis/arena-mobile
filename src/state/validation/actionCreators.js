import {createActions} from 'redux-actions';

import types from './actionTypes';

const {validation} = createActions({
  /* VALIDATION */
  [types.SET_VALIDATION]: ({validation}) => ({validation}),
});

export default validation;
