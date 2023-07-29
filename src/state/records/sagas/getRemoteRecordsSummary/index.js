import {put, select, call, all, delay} from 'redux-saga/effects';

import {checkIfCurrentServerIsTheSurveysServer} from 'arena/survey';
import {selectors as appSelectors} from 'state/app';
import recordsApi from 'state/records/api';
import surveySelectors from 'state/survey/selectors';

import recordsActions from '../../actionCreators';

function* handleGetRemoteRecordsSummary() {
  try {
    yield put(
      recordsActions.setGettingRemoteRecordsSummary({
        isGettingRemoteRecordsSummary: true,
      }),
    );

    yield delay(300);
    const [survey, serverUrl, cycle] = yield all([
      select(surveySelectors.getSurvey),
      select(appSelectors.getServerUrl),
      select(surveySelectors.getSurveyCycle),
    ]);

    const surveyId = survey?.id;
    yield call(checkIfCurrentServerIsTheSurveysServer, {survey, serverUrl});
    const recordsSummary = yield call(recordsApi.getRecordsSummary, {
      serverUrl,
      surveyId,
      cycle,
    });
    const {list} = recordsSummary;

    const recordsSummaryByRecordUuid = list.reduce((acc, recordSummary) => {
      acc[recordSummary.uuid] = recordSummary;
      return acc;
    }, {});

    yield put(
      recordsActions.setRemoteRecordsSummary({
        recordsSummary: recordsSummaryByRecordUuid,
      }),
    );
  } catch (e) {
    yield put(
      recordsActions.setGettingRemoteRecordsSummaryError({
        error: true,
      }),
    );
    console.log(e);
  } finally {
    yield put(
      recordsActions.setGettingRemoteRecordsSummary({
        isGettingRemoteRecordsSummary: false,
      }),
    );
    console.log('Finally:recordsData');
  }
}

export default handleGetRemoteRecordsSummary;

// TODO allow to filter recordsSummary on the server by cycle
