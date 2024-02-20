import {select, call} from 'redux-saga/effects';

import {cleanSurvey} from 'state/__persistence';

import surveySelectors from '../../selectors';
import * as navigator from 'state/navigatorService';

import {StackActions} from '@react-navigation/core';
import {ROUTES} from 'navigation/constants';

function* handleDeleteSurveyData({payload}) {
  const {surveyUuid} = payload;
  const selectedSurveyUuid = yield select(
    surveySelectors.getSelectedSurveyUuid,
  );
  if (surveyUuid === selectedSurveyUuid) {
    const cycle = yield select(surveySelectors.getSurveyCycle);
    yield call(cleanSurvey, {surveyUuid, cycle});
    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.HOME));
  }
}

export default handleDeleteSurveyData;
