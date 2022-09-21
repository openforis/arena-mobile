import Toast from 'react-native-tiny-toast';
import {call} from 'redux-saga/effects';

export function* handleShowToast({message}) {
  yield call(Toast.show, message, {
    duration: 10000,
  });
}
