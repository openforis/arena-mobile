import {createActions} from 'redux-actions';

import types from './actionTypes';

const {records} = createActions({
  [types.getRemoteRecordsSummary$]: () => ({}),

  [types.deleteRecord$]: ({recordUuid, callBack}) => ({recordUuid, callBack}),
  [types.SET_RECORD]: ({record, isCreating = false}) => ({record, isCreating}),
  [types.CLEAN_RECORD]: ({recordUuid}) => ({
    recordUuid,
  }),
  [types.CLEAN_RECORDS]: ({recordUuids}) => ({
    recordUuids,
  }),
});

export default records;
