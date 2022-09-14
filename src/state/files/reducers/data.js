import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

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
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
