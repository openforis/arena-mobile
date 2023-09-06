import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import {call, select, put} from 'redux-saga/effects';

import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';
import formPreferencesSelectors from 'state/form/selectors/preferences';
import nodesSelectors from 'state/nodes/selectors';
import surveySelectors from 'state/survey/selectors';

import getNextNode from './getNextNode';

/* Function to jump between nodes */
/*
  DONT JUMP IF:
  - current nodenodef is coordinate, file, boolean
  - nextNodeDef is file
  - current node is not valid

*/

function* callbackAndJump({currentNode, callback, shouldJump = true}) {
  const isSingleNodeView = yield select(formSelectors.isSingleNodeView);
  let _hasToJump = yield select(formPreferencesSelectors.getHasToJump);

  if (!shouldJump || !_hasToJump) {
    if (callback) {
      yield call(callback);
    }
    return;
  }
  const currentNodeDef = yield select(state =>
    surveySelectors.getNodeDefByUuid(state, currentNode.nodeDefUuid),
  );

  if (isSingleNodeView || NodeDefs.isMultiple(currentNodeDef)) {
    _hasToJump = false;
  }

  const currentNodeValidation = yield select(state =>
    formSelectors.getValidationByNodes(state, [currentNode]),
  );

  if (
    currentNodeValidation.valid === false &&
    ![NodeDefType.time, NodeDefType.date].includes(currentNodeDef.type)
  ) {
    return;
  }

  const parentNode = yield select(state =>
    nodesSelectors.getNodeByUuid(state, currentNode.parentUuid),
  );

  if (
    [NodeDefType.file].includes(currentNodeDef.type) ||
    (NodeDefs.isMultiple(currentNodeDef) &&
      ![NodeDefType.code].includes(currentNodeDef.type))
  ) {
    _hasToJump = false;
  }

  let nextNode = false;

  if (parentNode && _hasToJump) {
    nextNode = yield call(getNextNode, {
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
