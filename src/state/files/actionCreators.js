import {createActions} from 'redux-actions';

import types from './actionTypes';

const {files} = createActions({
  [types.SET_FILES]: ({filesByUuid = []}) => ({filesByUuid}),
  [types.DELETE_FILES]: ({filesUuids = []}) => ({filesUuids}),
});

export default files;
