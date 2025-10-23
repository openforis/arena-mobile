import { Snackbar } from "react-native-paper";
import { useDispatch } from "react-redux";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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
    // @ts-expect-error TS(7027): Unreachable code detected.
    <Snackbar visible={!!textKey} onDismiss={onDismiss}>
      {t(textKey: any, textParams: any)}
    </Snackbar>
  );
};
