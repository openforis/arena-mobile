import { ConfirmActions } from "./reducer";

export type ConfirmResult = {
  selectedMultipleChoiceValues: any[];
  selectedSingleChoiceValue: string;
};

const confirm = async ({
  dispatch,
  cancelButtonTextKey,
  confirmButtonTextKey,
  messageKey,
  messageParams,
  titleKey,
  titleParams,
  ...otherParams
}: any): Promise<ConfirmResult | null> =>
  new Promise((resolve, reject) => {
    try {
      dispatch(
        ConfirmActions.show({
          cancelButtonTextKey,
          confirmButtonTextKey,
          messageKey,
          messageParams,
          titleKey,
          titleParams,
          ...otherParams,
          onConfirm: ({
            selectedMultipleChoiceValues,
            selectedSingleChoiceValue,
          }: any) => {
            dispatch(ConfirmActions.dismiss());

            resolve({
              selectedMultipleChoiceValues,
              selectedSingleChoiceValue,
            });
          },
          onCancel: () => resolve(null),
        })
      );
    } catch (error) {
      reject(error);
    }
  });

export const ConfirmUtils = {
  confirm,
};
