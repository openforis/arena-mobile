import {createSelector} from 'reselect';

const getState = state => state;
const getFormState = createSelector(getState, state => state?.form || {});
const getFormStatePreferences = createSelector(
  getFormState,
  state => state?.preferences || {},
);

const getHasToJump = createSelector(
  getFormStatePreferences,
  preferences => preferences?.hasToJump || false,
);

const getHasToLockRecordsWhenLeave = createSelector(
  getFormStatePreferences,
  preferences => preferences?.hasToLockRecordsWhenLeave || false,
);

const getHasToShowNotRelevantOnNavigationTree = createSelector(
  getFormStatePreferences,
  preferences => preferences?.hasToShowNotRelevantOnNavigationTree || false,
);

const showDescriptions = createSelector(
  getFormStatePreferences,
  preferences => preferences?.showDescriptions || false,
);

const isSingleNodeView = createSelector(
  getFormStatePreferences,
  preferences => preferences?.isSingleNodeView || false,
);

const showCloseButtonInForm = createSelector(
  getFormStatePreferences,
  preferences => preferences?.showCloseButtonInForm || false,
);

export default {
  getHasToJump,
  getHasToLockRecordsWhenLeave,
  getHasToShowNotRelevantOnNavigationTree,
  showDescriptions,
  isSingleNodeView,
  showCloseButtonInForm,
};
