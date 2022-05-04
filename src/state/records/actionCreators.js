import {createActions} from 'redux-actions';

import types from './actionTypes';

const {records} = createActions({
  [types.createRecord$]: () => ({}),
  [types.deleteRecord$]: ({recordUuid}) => ({recordUuid}),
  [types.SET_RECORD]: ({record}) => ({record}),
  [types.CLEAN_RECORD]: ({recordUuid}) => ({
    recordUuid,
  }),
});

export default records;
