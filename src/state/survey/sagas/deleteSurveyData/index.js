import {select, call} from 'redux-saga/effects';

import {cleanSurvey} from 'state/__persistence';

import surveySelectors from '../../selectors';

function* handleDeleteSurveyData({payload}) {
  const {surveyUuid} = payload;
  const selectedSurveyUuid = yield select(
    surveySelectors.getSelectedSurveyUuid,
  );
  if (surveyUuid === selectedSurveyUuid) {
    const cycle = yield select(surveySelectors.getSurveyCycle);
    yield call(cleanSurvey, {surveyUuid, cycle});
  }
}

export default handleDeleteSurveyData;
