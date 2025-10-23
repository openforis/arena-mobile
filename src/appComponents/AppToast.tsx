import { Snackbar } from "react-native-paper";
import { useDispatch } from "react-redux";

import { ToastActions, ToastSelectors } from "state";
import { Text } from "components/Text";

export const AppToast = () => {
  const dispatch = useDispatch();

  const toastContent = ToastSelectors.useToastContent();
  const { textKey, textParams } = toastContent;

  const onDismiss = () => {
    dispatch(ToastActions.dismiss());
  };

  return (
    <Snackbar visible={!!textKey} onDismiss={onDismiss}>
      <Text textKey={textKey} textParams={textParams} />
    </Snackbar>
  );
};
