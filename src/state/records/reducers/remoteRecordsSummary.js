import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const remoteRecordsSummary = handleActions(
  {
    [actions.setRemoteRecordsSummary]: (_, {payload: {recordsSummary}}) =>
      Object.assign({}, recordsSummary, {isReady: true}),

    [actions.cleanRemoteRecordsSummary]: () =>
      initialState.remoteRecordsSummary || {},
    [globalActions.reset]: () => initialState.remoteRecordsSummary || {},
  },
  initialState.remoteRecordsSummary,
);

export default remoteRecordsSummary;
