import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const ui = handleActions(
  {
    [actions.setLoading]: (state, {payload: {isLoading}}) => ({
      ...state,
      isLoading,
    }),
    [actions.setError]: (state, {payload: {error}}) => ({
      ...state,
      error,
    }),
    [actions.setGettingRemoteRecordsSummary]: (
      state,
      {payload: {isGettingRemoteRecordsSummary}},
    ) => ({
      ...state,
      isGettingRemoteRecordsSummary,
    }),
    [actions.setGettingRemoteRecordsSummaryError]: (
      state,
      {payload: {error}},
    ) => ({
      ...state,
      remoteRecordsSummaryError: error,
    }),
    [actions.getRemoteRecordsSummary$]: state => ({
      ...state,
      remoteRecordsSummaryError: false,
    }),
    [actions.cleanRemoteRecordsSummary]: state => ({
      ...state,
      remoteRecordsSummaryError: false,
    }),

    [globalActions.reset]: () => initialState.ui || {},
  },
  initialState.ui || {},
);

export default ui;
