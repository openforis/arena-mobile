import {Users} from '@openforis/arena-core';
import {createSelector} from 'reselect';

const getUserState = state => state?.user;
const getUser = createSelector(getUserState, user => user);
const getName = createSelector(getUser, user => user?.name);
const getEmail = createSelector(getUser, user => user?.email);
const getRole = createSelector(
  getUser,
  (_, surveyUuid) => surveyUuid,
  (user, surveyUuid) => {
    const role = Users.getAuthGroupBySurveyUuid(surveyUuid, true)(user);
    return role?.name || '';
  },
);

export default {
  getUser,
  getName,
  getEmail,
  getRole,
};
