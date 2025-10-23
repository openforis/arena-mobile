import { ConfirmActions } from "./reducer";

const confirm = async ({
  dispatch,
  cancelButtonTextKey,
  confirmButtonTextKey,
  messageKey,
  messageParams,
  titleKey,
  titleParams,
  ...otherParams
}: any) =>
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
            selectedSingleChoiceValue
          }: any) => {
            dispatch(ConfirmActions.dismiss());

            resolve({
              selectedMultipleChoiceValues,
              selectedSingleChoiceValue,
            });
          },
          onCancel: () => resolve(false),
        })
      );
    } catch (error) {
      reject(error);
    }
  });

export const ConfirmUtils = {
  confirm,
};
