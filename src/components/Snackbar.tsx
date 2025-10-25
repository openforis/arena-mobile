import { Snackbar as RNPSnackbar } from "react-native-paper";

type Props = {
  content?: any;
  onDismiss: () => void;
  visible?: boolean;
};

export const Snackbar = (props: Props) => {
  const { content, onDismiss, visible = false } = props;
  return (
    <RNPSnackbar visible={visible} onDismiss={onDismiss}>
      {content}
    </RNPSnackbar>
  );
};
