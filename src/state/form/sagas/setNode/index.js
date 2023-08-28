import {put, select} from 'redux-saga/effects';

import formActions from '../../actionCreators';
import formSelectors from '../../selectors';

function* handleSelectEntityNode({payload}) {
  const {node} = payload;
  const isRecordLocked = yield select(formSelectors.isRecordLocked);
  if (!isRecordLocked) {
    yield put(formActions.setNodeToEdit({node}));
  }
}

export default handleSelectEntityNode;
