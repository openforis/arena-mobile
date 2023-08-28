import {createActions} from 'redux-actions';

import types from './actionTypes';

const {records} = createActions({
  [types.getRemoteRecordsSummary$]: () => ({}),
  [types.SET_REMOTE_RECORDS_SUMMARY]: ({recordsSummary}) => ({recordsSummary}),
  [types.CLEAN_REMOTE_RECORDS_SUMMARY]: () => ({}),
  [types.SET_GETTING_REMOTE_RECORDS_SUMMARY]: ({
    isGettingRemoteRecordsSummary,
  }) => ({
    isGettingRemoteRecordsSummary,
  }),
  [types.SET_GETTING_REMOTE_RECORDS_SUMMARY_ERROR]: ({error}) => ({
    error,
  }),

  [types.deleteRecord$]: ({recordUuid, callBack, showToast}) => ({
    recordUuid,
    callBack,
    showToast,
  }),
  [types.SET_RECORD]: ({record, isCreating = false}) => ({record, isCreating}),
  [types.LOCK_RECORD]: ({recordUuid}) => ({recordUuid}),
  [types.UNLOCK_RECORD]: ({recordUuid}) => ({recordUuid}),
  [types.CLEAN_RECORD]: ({recordUuid}) => ({
    recordUuid,
  }),
  [types.CLEAN_RECORDS]: ({recordUuids}) => ({
    recordUuids,
  }),
});

export default records;
