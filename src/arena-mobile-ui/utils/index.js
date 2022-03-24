import {Alert, Platform} from 'react-native';

const OPTIONS_BY_OS = {
  android: {cancelable: false},
  ios: {},
};

const ALERT_FUNCTION_BY_OS = {
  ios: Alert.prompt,
  android: Alert.alert,
};

export const alert = ({
  title,
  message,
  acceptText,
  onAccept,
  dismissText,
  onDismiss,
}) => {
  const buttons = [
    dismissText && {
      text: dismissText,
      onPress: () => {
        onDismiss?.();
      },
      style: 'cancel',
    },
    acceptText && {
      text: acceptText,
      onPress: () => {
        onAccept?.();
      },
    },
  ];

  const _alert = ALERT_FUNCTION_BY_OS?.[Platform.OS];
  _alert(title, message, buttons, OPTIONS_BY_OS?.[Platform.OS]);
};
