import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setRecord]: (state, {payload: {record = {}}}) => ({
      ...state,
      [record.id]: {...record},
    }),
    [actions.deleteRecord]: (state, {payload: {recordId}}) => {
      let newState = {...state};
      delete newState[recordId];
      return newState;
    },
  },
  initialState.accessData || {},
);

export default data;
