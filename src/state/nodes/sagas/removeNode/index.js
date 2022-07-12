import {call} from 'redux-saga/effects';

function* handleRemoveNode({payload}) {
  yield call(console.log, payload);
}

export default handleRemoveNode;
