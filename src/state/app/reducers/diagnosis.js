import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const appDiagnosis = handleActions(
  {
    [actions.diagnosisSetShareDataLog]: (state, {payload: {shareDataLog}}) => ({
      ...state,
      shareDataLog,
    }),
    [actions.clean]: () => initialState.accessData,
  },
  initialState.diagnosis,
);

export default appDiagnosis;
