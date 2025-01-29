import { Snackbar } from "react-native-paper";
import { useDispatch } from "react-redux";

import { useTranslation } from "localization";
import { ToastActions, ToastSelectors } from "state";

export const AppToast = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const toastContent = ToastSelectors.useToastContent();
  const { textKey, textParams } = toastContent;

  const onDismiss = () => {
    dispatch(ToastActions.dismiss());
  };

  return (
    <Snackbar visible={!!textKey} onDismiss={onDismiss}>
      {t(textKey, textParams)}
    </Snackbar>
  );
};
