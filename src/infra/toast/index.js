import Toast from 'react-native-tiny-toast';
import {call} from 'redux-saga/effects';

export function* handleShowToast({message, duration: duration = 10000}) {
  yield call(Toast.show, message, {duration});
}
