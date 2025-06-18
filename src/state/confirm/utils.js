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
}) =>
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
          }) => {
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
