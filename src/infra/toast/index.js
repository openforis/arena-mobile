import Toast from 'react-native-toast-message';
import {call} from 'redux-saga/effects';

export const showToast = Toast.show;

export function* handleShowToast({message, duration: duration = 10000}) {
  yield call(showToast, {
    type: 'info',
    position: 'bottom',
    text1: message,
    visibilityTime: duration,
    props: {
      text1NumberOfLines: 4,
    },
  });
}
