import { Snackbar as RNPSnackbar } from "react-native-paper";

type Props = {
  content?: any;
  onDismiss: () => void;
  // shows a close icon button that dismisses the snackbar
  showCloseButton?: boolean;
  visible?: boolean;
};

export const Snackbar = (props: Props) => {
  const {
    content,
    onDismiss,
    showCloseButton = false,
    visible = false,
  } = props;
  return (
    <RNPSnackbar
      onDismiss={onDismiss}
      onIconPress={showCloseButton ? onDismiss : undefined}
      visible={visible}
    >
      {content}
    </RNPSnackbar>
  );
};
