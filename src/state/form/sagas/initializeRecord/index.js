import {StackActions} from '@react-navigation/core';
import {call, select, put} from 'redux-saga/effects';

import {ROUTES} from 'navigation/constants';
import formActions from 'state/form/actionCreators';
import * as navigator from 'state/navigatorService';
import handleCreateNodeAndDescendants from 'state/nodes/sagas/createNodeAndDescendants';
import {handleCreateRecord} from 'state/records/sagas';
import surveySelectors from 'state/survey/selectors';

function* handleInitializeRootEntity() {
  const rootNodeDef = yield select(surveySelectors.getNodeDefRoot);

  const node = yield call(handleCreateNodeAndDescendants, {
    nodeDef: rootNodeDef,
    parentNode: null,
  });

  yield put(formActions.setParentEntityNode({node: node}));
}

function* handleInitializeRecord() {
  try {
    yield put(formActions.clean());

    const record = yield call(handleCreateRecord);

    yield put(formActions.setRecord({record: record}));
    yield call(handleInitializeRootEntity);

    yield call(navigator.navigatorDispatch, StackActions.push(ROUTES.FORM));
  } catch (error) {
    console.log('Error', error);
  } finally {
    console.log('Finally');
  }
}

export default handleInitializeRecord;
