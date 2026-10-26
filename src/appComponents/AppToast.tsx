import { Snackbar } from "components";
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
    <Snackbar
      content={t(textKey, textParams)}
      onDismiss={onDismiss}
      showCloseButton
      visible={!!textKey}
    />
  );
};
