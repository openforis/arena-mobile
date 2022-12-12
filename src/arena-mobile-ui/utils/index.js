import {Alert, Platform} from 'react-native';
import prompt from 'react-native-prompt-android';

export const alert = ({
  title,
  message,
  acceptText,
  onAccept,
  dismissText,
  onDismiss = () => null,
  dismissStyle = 'cancel',
  acceptStyle = 'default',
  requiredText = false,
  requiredTextMessage = '',
}) => {
  const buttons = [
    dismissText && {
      text: dismissText,
      onPress: () => {
        onDismiss?.();
      },
      style: dismissStyle,
    },
    acceptText && {
      text: acceptText,
      onPress: (inputText = null) => {
        if (requiredText && inputText !== requiredText) {
          return;
        }
        onAccept?.();
      },
      style: acceptStyle,
    },
  ];

  const _message = `
    ${message}
    
    ${requiredTextMessage}`;

  if (Platform.OS === 'ios') {
    const type = requiredText ? 'plain-text' : 'default';
    const defaultValue = '';
    const keyboardType = 'default';

    return Alert.prompt(
      title,
      _message,
      buttons,
      type,
      defaultValue,
      keyboardType,
    );
  }
  if (requiredText) {
    prompt(title, _message, buttons, {
      type: 'text',
      cancelable: false,
      defaultValue: '',
    });
  }

  return Alert.alert(title, message, buttons, {cancelable: false});
};
