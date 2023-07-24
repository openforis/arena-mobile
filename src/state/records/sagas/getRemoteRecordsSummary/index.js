import {put, select, call} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import {selectors as appSelectors} from 'state/app';
import recordsApi from 'state/records/api';
import surveySelectors from 'state/survey/selectors';

import recordsActions from '../../actionCreators';

function* handleGetRemoteRecordsSummary({payload}) {
  try {
    const survey = yield select(surveySelectors.getSurvey);
    const serverUrl = yield select(appSelectors.getServerUrl);
    const cycle = yield select(surveySelectors.getSurveyCycle);

    const surveyId = survey?.id;
    yield call(checkIfCurrentServerIsTheSurveysServer, {survey, serverUrl});
    const recordsSummary = yield call(recordsApi.getRecordsSummary, {
      serverUrl,
      surveyId,
      cycle,
    });
    const {list} = recordsSummary;
    //yield put(recordsActions.setRemoteRecordsSummary({recordsSummary}));
  } catch (e) {
    console.log(e);
  } finally {
    console.log('Finally:recordsData');
  }
}

export default handleGetRemoteRecordsSummary;

// TODO allow to filter recordsSummary on the server by cycle
