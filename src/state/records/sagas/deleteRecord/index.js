import {put, select, call} from 'redux-saga/effects';

import {Objects} from 'infra/objectUtils';
import {cleanRecord} from 'state/__persistence';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

import recordsActions from '../../actionCreators';
import recordsSelectors from '../../selectors';

function* handleDeleteRecord({payload}) {
  const {recordUuid, callBack} = payload;
  let record = yield select(state =>
    recordsSelectors.getRecordByUuid(state, recordUuid),
  );

  const currentRecordUuid = yield select(formSelectors.getRecordUuid);
  yield put(recordsActions.cleanRecord({recordUuid: recordUuid}));

  if (record !== false && !Objects.isEmpty(record)) {
  } else {
    const cycle = yield select(surveySelectors.getSurveyCycle);
    const surveyUuid = yield select(surveySelectors.getSelectedSurveyUuid);
    record = {uuid: recordUuid, cycle, surveyUuid};
  }
  yield call(cleanRecord, record);

  if (currentRecordUuid === recordUuid) {
    yield put(formActions.clean());
  }
  if (callBack) {
    yield call(callBack);
  }
}

export default handleDeleteRecord;
