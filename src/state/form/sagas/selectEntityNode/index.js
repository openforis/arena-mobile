import {put} from 'redux-saga/effects';

import formActions from '../../actionCreators';

function* handleSelectEntityNode({payload}) {
  const {node} = payload;

  yield put(formActions.setParentEntityNode({node}));
}

export default handleSelectEntityNode;
