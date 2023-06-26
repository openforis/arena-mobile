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

export default {
  getHasToJump,
};
