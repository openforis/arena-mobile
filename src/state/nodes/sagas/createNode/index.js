import {NodeFactory} from '@openforis/arena-core';
import moment from 'moment';
import {call, select, all, put} from 'redux-saga/effects';

import formSelectors from 'state/form/selectors';
import {actions as nodesActions} from 'state/nodes';
import surveySelectors from 'state/survey/selectors';

const _createNode = ({survey, record, nodeDef, parentNode}) => {
  return {
    ...NodeFactory.createInstance({
      nodeDefUuid: nodeDef?.uuid,
      recordUuid: record?.uuid,
      parentNode: parentNode,
      value: null,
    }),
    dateCreated: moment().toISOString(),
    dateModified: moment().toISOString(),
    surveyUuid: survey.uuid,
    refData: null,
  };
};

function* handleCreateChildrenNodesInEntity({payload}) {
  const {parentNode} = payload;

  const parentNodeDef = yield select(state =>
    surveySelectors.getNodeDefByUuid(state, parentNode.nodeDefUuid),
  );

  const childrenNodeDefs = yield select(state =>
    surveySelectors.getNodeDefChildren(state, parentNodeDef),
  );

  if (childrenNodeDefs?.length <= 0) {
    return [];
  }

  const nodes = yield all(
    childrenNodeDefs
      .filter(nodeDef => nodeDef.type !== 'entity')
      .map(childrenNodeDef =>
        call(handleCreateNode, {
          nodeDef: childrenNodeDef,
          parentNode,
        }),
      ) || [],
  );

  return nodes;
}

function* handleCreateNode({nodeDef, parentNode}) {
  const [record, survey] = yield all([
    select(formSelectors.getRecord),
    select(surveySelectors.getSurvey),
  ]);

  const node = yield call(_createNode, {
    record,
    parentNode,
    nodeDef,
    survey,
  });

  yield put(nodesActions.setNode({node}));

  if (nodeDef.type === 'entity') {
    yield call(handleCreateChildrenNodesInEntity, {
      payload: {parentNode: node},
    });
  }

  return node;
}

export default handleCreateNode;
