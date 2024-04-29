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
    [actions.setHasToShowNotRelevantOnNavigationTree]: (
      state,
      {payload: {hasToShowNotRelevantOnNavigationTree}},
    ) => ({
      ...state,
      hasToShowNotRelevantOnNavigationTree,
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
  },
  initialState.preferences || {},
);

export default preferences;
