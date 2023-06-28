import {NodeDefType} from '@openforis/arena-core';
import {select} from 'redux-saga/effects';

import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

function* getNextNode({currentNode, parentNode}) {
  let nextNode = false;

  const formNodeDefsUuids = yield select(
    formSelectors.getFormAttributesNodeDefsUuids,
  );

  const currentNodeDefIndex = formNodeDefsUuids.indexOf(
    currentNode.nodeDefUuid,
  );

  let nextIndex = -1;
  if (
    currentNodeDefIndex >= 0 &&
    currentNodeDefIndex < formNodeDefsUuids.length - 1
  ) {
    nextIndex = currentNodeDefIndex + 1;
  }

  if (nextIndex >= 0) {
    const nextNodeDefUuid = formNodeDefsUuids[nextIndex];

    const nextNodeDef = yield select(state =>
      surveySelectors.getNodeDefByUuid(state, nextNodeDefUuid),
    );

    if (
      nextNodeDef &&
      [
        NodeDefType.text,
        NodeDefType.integer,
        NodeDefType.decimal,
        NodeDefType.date,
        NodeDefType.time,
        NodeDefType.code,
        NodeDefType.taxon,
        NodeDefType.coordinate,
        NodeDefType.boolean,
        NodeDefType.file,
      ].includes(nextNodeDef.type)
    ) {
      const currentEntityNodeDescendants = yield select(state =>
        formSelectors.getNodeDescendants(state, parentNode),
      );

      nextNode = currentEntityNodeDescendants.find(
        _node => _node.nodeDefUuid === nextNodeDefUuid,
      );
    }
  }
  return nextNode;
}

export default getNextNode;
