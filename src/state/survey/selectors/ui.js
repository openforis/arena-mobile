import {createSelector} from 'reselect';

import {getUiState} from './base';

export const getIsUploading = createSelector(getUiState, ui => ui.isUploading);

export const getUploadProgress = createSelector(
  getUiState,
  ui => ui.uploadProgress,
);
