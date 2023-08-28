import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setFiles]: (state, {payload: {filesByUuid}}) => ({
      ...state,
      ...filesByUuid,
    }),
    [actions.deleteFiles]: (state, {payload: {filesUuids = []}}) => {
      const newFiles = {...state};
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
