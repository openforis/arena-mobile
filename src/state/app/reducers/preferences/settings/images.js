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
      {payload: {compressMaxHeight, keepAspectRatio}},
    ) => {
      const ratio = compressMaxHeight / state.compressMaxHeight;

      return {
        ...state,
        compressMaxHeight,
        ...(keepAspectRatio
          ? {compressMaxWidth: Math.floor(state.compressMaxWidth * ratio)}
          : {}),
      };
    },
    [actions.setImagesCompressMaxWidth]: (
      state,
      {payload: {compressMaxWidth, keepAspectRatio}},
    ) => {
      const ratio = compressMaxWidth / state.compressMaxWidth;

      return {
        ...state,
        compressMaxWidth,
        ...(keepAspectRatio
          ? {compressMaxHeight: Math.floor(state.compressMaxHeight * ratio)}
          : {}),
      };
    },
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
