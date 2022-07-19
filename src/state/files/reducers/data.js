import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setFiles]: (state, {payload: {filesByUuid}}) => {
      return {
        ...state,
        ...filesByUuid,
      };
    },
    [actions.deleteFiles]: (state, {payload: {filesUuids = []}}) => {
      const newFiles = Object.assign({}, state);

      filesUuids.forEach(fileUuid => {
        delete newFiles[fileUuid];
      });

      return newFiles;
    },
    [actions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
