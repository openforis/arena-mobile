import {Alert, Platform} from 'react-native';
import prompt from 'react-native-prompt-android';

export const alert = ({
  title,
  message,
  acceptText,
  onAccept,
  dismissText,
  onDismiss,
  dismissStyle,
  acceptStyle,
  requiredText,
  requiredTextMessage,
}) => {
  const buttons = [
    dismissText
      ? {
          text: dismissText,
          onPress: () => {
            onDismiss?.();
          },
          style: dismissStyle,
        }
      : null,
    acceptText
      ? {
          text: acceptText,
          onPress: (inputText = null) => {
            if (requiredText && inputText.trim() !== requiredText.trim()) {
              return;
            }
            onAccept?.();
          },
          style: acceptStyle,
        }
      : null,
  ].filter(button => button !== null);

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
    return prompt(title, _message, buttons, {
      type: 'text',
      cancelable: false,
      defaultValue: '',
      placeholder: '...',
    });
  }

  return Alert.alert(title, message, buttons, {cancelable: false});
};

alert.defaultProps = {
  title: '',
  onAccept: () => null,
  onDismiss: () => null,
  dismissStyle: 'cancel',
  acceptStyle: 'default',
  requiredText: false,
  requiredTextMessage: '',
};
