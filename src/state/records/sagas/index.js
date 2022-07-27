import moment from 'moment';
import {takeLatest, put, select, call, all} from 'redux-saga/effects';

import {uuidv4} from 'infra/uuid';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';
import {selectors as userSelector} from 'state/user';

import recordsActions from '../actionCreators';
import recordsActionTypes from '../actionTypes';

// TODO change when cycle
// extract this creators to arena
const _createRecord = ({survey, user}) => {
  return {
    preview: false, // no idea
    uuid: uuidv4(),
    ownerUuid: user.uuid,
    ownerName: user.name,
    dateCreated: moment().toISOString(),
    surveyUuid: survey.uuid,
    surveyId: survey.id,
    step: '1', // get from survey
    cycle: '0', // get from survey
    // validation
    // nodes
    // _nodeRootUuid
    // _nodesByParentAndDef
    // _nodesByDef
  };
};

export function* handleCreateRecord() {
  let record = false;
  try {
    const [survey, user] = yield all([
      select(surveySelectors.getSurvey),
      select(userSelector.getUser),
    ]);

    record = yield call(_createRecord, {survey, user});
    yield put(recordsActions.setRecord({record}));
  } catch (error) {
    console.log('Error', error);
  }
  return record;
}

export function* handleDeleteRecord({payload}) {
  const {recordUuid, callBack} = payload;
  yield put(recordsActions.cleanRecord({recordUuid: recordUuid}));
  const currentRecordUuid = yield select(formSelectors.getRecordUuid);
  if (currentRecordUuid === recordUuid) {
    yield put(formActions.clean());
  }
  if (callBack) {
    yield call(callBack);
  }
}

export default function* () {
  yield takeLatest(recordsActionTypes.createRecord$, handleCreateRecord);
  yield takeLatest(recordsActionTypes.deleteRecord$, handleDeleteRecord);
}
