import {call, select, put, all} from 'redux-saga/effects';

import formSelectors from 'state/form/selectors';

import validationActions from 'state/validation/actionCreators';
import nodesActions from 'state/nodes/actionCreators';
import nodesSelectors from 'state/nodes/selectors';
import recordsActions from 'state/records/actionCreators';

import surveySelectors from 'state/survey/selectors';

import {updateNodeAndDependants, callbackAndJump} from './methods';

function* handleUpdateNode({payload}) {
  try {
    const {updatedNode, callback, shouldJump} = payload;

    const [survey, node, fullRecord] = yield all([
      select(surveySelectors.getSurvey),
      select(state => nodesSelectors.getNodeByUuid(state, updatedNode.uuid)),
      select(formSelectors.getFullRecord),
    ]);

    if (!node?.uuid) {
      return;
    }

    const {
      nodes: updatedNodes,
      validation: updatedValidation,
      record: updatedRecord,
    } = yield call(updateNodeAndDependants, {
      node: updatedNode,
      record: fullRecord,
      survey,
    });

    delete updatedRecord.validation;
    delete updatedRecord.nodes;
    yield all([
      put(recordsActions.setRecord({record: updatedRecord})),
      put(nodesActions.setNodes({nodes: updatedNodes})),
      put(validationActions.setValidation({validation: updatedValidation})),
    ]);

    yield call(callbackAndJump, {
      currentNode: updatedNode,
      callback,
      shouldJump,
    });
  } catch (e) {
    console.log('Updatenode', e);
  }
}

export default handleUpdateNode;
