import {createActions} from 'redux-actions';

import types from './actionTypes';

const {records} = createActions({
  [types.SET_RECORD]: ({record}) => ({record}),
  [types.DELETE_RECORD]: ({recordId}) => ({
    recordId,
  }),
});

export default records;
