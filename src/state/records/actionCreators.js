import {createActions} from 'redux-actions';

import types from './actionTypes';

const {records} = createActions({
  [types.deleteRecord$]: ({recordUuid}) => ({recordUuid}),
  [types.SET_RECORD]: ({record}) => ({record}),
  [types.CLEAN_RECORD]: ({recordUuid}) => ({
    recordUuid,
  }),
  [types.CLEAN_RECORDS]: ({recordUuids}) => ({
    recordUuids,
  }),
});

export default records;
