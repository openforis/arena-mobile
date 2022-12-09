import {SRSs} from '@openforis/arena-core';
import moment from 'moment';
import {put, select, call, all} from 'redux-saga/effects';

import {uuidv4} from 'infra/uuid';
import surveySelectors from 'state/survey/selectors';
import {selectors as userSelector} from 'state/user';

import recordsActions from '../../actionCreators';

// extract this creators to arena-core
const _createRecord = ({survey, user, cycle}) => {
  return {
    preview: false, // no idea
    uuid: uuidv4(),
    ownerUuid: user.uuid,
    ownerName: user.name,
    dateCreated: moment().toISOString(),
    surveyUuid: survey.uuid,
    surveyId: survey.id,
    step: '1', // get from survey
    cycle: String(cycle),
    // validation
    // nodes
    // _nodeRootUuid
    // _nodesByParentAndDef
    // _nodesByDef
  };
};

function* handleCreateRecord() {
  let record = false;
  try {
    const [survey, user, cycle] = yield all([
      select(surveySelectors.getSurvey),
      select(userSelector.getUser),
      select(surveySelectors.getSurveyCycle),
    ]);

    record = yield call(_createRecord, {survey, user, cycle});

    yield call(SRSs.init);

    yield put(recordsActions.setRecord({record}));
  } catch (error) {
    console.log('Error', error);
  }
  return record;
}

export default handleCreateRecord;
