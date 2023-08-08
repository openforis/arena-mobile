import {handleActions} from 'redux-actions';

import actions from '../../../actionCreators';
import initialState from '../../../initial.state';

const appPreferences = handleActions(
  {
    [actions.setImagesCompressQuality]: (
      state,
      {payload: {compressQuality = 0.5}},
    ) => ({...state, compressQuality}),
    [actions.setImagesCompressMaxHeight]: (
      state,
      {payload: {compressMaxHeight}},
    ) => ({
      ...state,
      compressMaxHeight,
    }),
    [actions.setImagesCompressMaxWidth]: (
      state,
      {payload: {compressMaxWidth}},
    ) => ({
      ...state,
      compressMaxWidth,
    }),
    [actions.setIsMaxResolution]: (state, {payload: {isMaxResolution}}) => ({
      ...state,
      isMaxResolution,
    }),

    [actions.resetImagesQualityAndSize]: () =>
      initialState.preferences?.settings?.images,
  },
  initialState.preferences?.settings?.images,
);

export default appPreferences;
