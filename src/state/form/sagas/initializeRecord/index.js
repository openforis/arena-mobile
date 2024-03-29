import {StackActions} from '@react-navigation/core';
import {call, select, put} from 'redux-saga/effects';

import {Objects} from 'infra/objectUtils';
import {ROUTES} from 'navigation/constants';
import {persistRecordsAndNodes} from 'state/__persistence';
import formActions from 'state/form/actionCreators';
import * as navigator from 'state/navigatorService';
import handleCreateNodeAndDescendants from 'state/nodes/sagas/createNodeAndDescendants';
import handleCreateRecord from 'state/records/sagas/createRecord';
import surveySelectors from 'state/survey/selectors';

function* handleInitializeRootEntity() {
  const rootNodeDef = yield select(surveySelectors.getNodeDefRoot);

  const nodes = yield call(handleCreateNodeAndDescendants, {
    payload: {
      nodeDef: rootNodeDef,
      parentNode: null,
      isCreating: true,
    },
  });

  const rootNode = Object.values(nodes).find(node =>
    Objects.isEmpty(node.parentUuid),
  );

  yield put(formActions.setParentEntityNode({node: rootNode}));
}

function* handleInitializeRecord() {
  try {
    yield put(formActions.clean());

    yield call(persistRecordsAndNodes);

    const record = yield call(handleCreateRecord);

    delete record.nodes;
    yield put(formActions.setRecord({record: record}));

    yield call(handleInitializeRootEntity);

    yield call(navigator.navigatorDispatch, StackActions.replace(ROUTES.FORM));
  } catch (error) {
    console.log('Error', error);
  } finally {
    console.log('Finally');
  }
}

export default handleInitializeRecord;
