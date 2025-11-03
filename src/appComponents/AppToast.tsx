import { Snackbar } from "react-native-paper";

import { useTranslation } from "localization";
import { ToastActions, ToastSelectors, useAppDispatch } from "state";

export const AppToast = () => {
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const toastContent = ToastSelectors.useToastContent();
  const { textKey, textParams } = toastContent;

  const onDismiss = () => {
    dispatch(ToastActions.dismiss());
  };

  return (
    <Snackbar onDismiss={onDismiss} visible={!!textKey}>
      {t(textKey, textParams)}
    </Snackbar>
  );
};
