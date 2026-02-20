import { ConfirmActions, ConfirmShowParams, OnConfirmParams } from "./reducer";

export type ConfirmAsyncParams = Omit<
  ConfirmShowParams,
  "onConfirm" | "onCancel"
> & {
  dispatch: any;
};

const confirm = async (
  params: ConfirmAsyncParams,
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
          onCancel: async () => resolve(null),
        }),
      );
    } catch (error) {
      reject(error as Error);
    }
  });

export const ConfirmUtils = {
  confirm,
};
