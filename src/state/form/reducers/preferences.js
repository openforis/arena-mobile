import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const preferences = handleActions(
  {
    [actions.setHasToJump]: (state, {payload: {hasToJump}}) => ({
      ...state,
      hasToJump,
    }),
    [actions.setHasToLockRecordsWhenLeave]: (
      state,
      {payload: {hasToLockRecordsWhenLeave}},
    ) => ({
      ...state,
      hasToLockRecordsWhenLeave,
    }),
    [actions.setShowDescriptions]: (state, {payload: {showDescriptions}}) => ({
      ...state,
      showDescriptions,
    }),
    [actions.toggleSingleNodeView]: state => ({
      ...state,
      isSingleNodeView: !state.isSingleNodeView,
    }),
    [actions.toggleShowCloseButtonInForm]: state => ({
      ...state,
      showCloseButtonInForm: !state.showCloseButtonInForm,
    }),
    [actions.toggleEnableMultipleEntityHome]: state => ({
      ...state,
      enableMultipleEntityHome: !state.enableMultipleEntityHome,
    }),
  },
  initialState.preferences || {},
);

export default preferences;
