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
const showDescriptions = createSelector(
  getFormStatePreferences,
  preferences => preferences?.showDescriptions || false,
);

const isSingleNodeView = createSelector(
  getFormStatePreferences,
  preferences => preferences?.isSingleNodeView || false,
);

export default {
  getHasToJump,
  getHasToLockRecordsWhenLeave,
  showDescriptions,
  isSingleNodeView,
};
