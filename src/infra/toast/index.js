import Toast from 'react-native-toast-message';
import {call} from 'redux-saga/effects';

export function* handleShowToast({message, duration: duration = 10000}) {
  yield call(Toast.show, {
    type: 'info',
    position: 'bottom',
    text1: message,
    visibilityTime: duration,
    props: {
      text1NumberOfLines: 4,
    },
  });
}
