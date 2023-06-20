import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import nodesSelectors from 'state/nodes/selectors';
import surveySelectors from 'state/survey/selectors';

import getNextNodeDefUuid from './getNextNodeDefUuid';

/* Function to jump between nodes */
/*
  DONT JUMP IF:
  - current nodenodef is coordinate, file, boolean
  - nextNodeDef is file
  - current node is not valid

*/

function* callbackAndJump({currentNode, callback}) {
  const currentNodeValidation = yield select(state =>
    formSelectors.getValidationByNodes(state, [currentNode]),
  );

  if (currentNodeValidation.valid === false) {
    return;
  }

  const HAS_TO_JUMP = true;

  let _hasToJump = HAS_TO_JUMP;
  const parentNode = yield select(state =>
    nodesSelectors.getNodeByUuid(state, currentNode.parentUuid),
  );
  const currentNodeDef = yield select(state =>
    surveySelectors.getNodeDefByUuid(state, currentNode.nodeDefUuid),
  );

  if (
    [NodeDefType.file].includes(currentNodeDef.type) ||
    NodeDefs.isMultiple(currentNodeDef)
  ) {
    _hasToJump = false;
  }

  let nextNode = false;

  if (parentNode && _hasToJump) {
    nextNode = yield call(getNextNodeDefUuid, {
      currentNode,
      parentNode,
    });
  }

  if (callback) {
    yield call(callback);
  }
  if (nextNode) {
    yield put(formActions.setNode({node: nextNode}));
  }
}

export default callbackAndJump;
