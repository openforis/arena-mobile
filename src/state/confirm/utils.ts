import { ConfirmActions, ConfirmShowParams, OnConfirmParams } from "./reducer";

// shows a confirm dialog and resolves with the user's choices on confirm, or with null on cancel
// (or when the dialog is closed without an answer, e.g. replaced by another one)
const confirm = async (
  params: Omit<ConfirmShowParams, "onConfirm" | "onCancel"> & {
    dispatch: any;
  },
): Promise<OnConfirmParams | null> =>
  new Promise((resolve, reject) => {
    try {
      const { dispatch, ...otherParams } = params;
      dispatch(
        ConfirmActions.show({
          ...otherParams,
          onConfirm: (confirmParams: OnConfirmParams) => {
            dispatch(ConfirmActions.dismiss());
            resolve(confirmParams);
          },
          onCancel: () => resolve(null),
        }),
      );
    } catch (error) {
      reject(error as Error);
    }
  });

export const ConfirmUtils = {
  confirm,
};
