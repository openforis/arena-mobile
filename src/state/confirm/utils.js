import { ConfirmActions } from "./reducer";

const confirm = async ({
  dispatch,
  titleKey,
  titleParams,
  messageKey,
  messageParams,
  ...otherParams
}) =>
  new Promise((resolve, reject) => {
    try {
      dispatch(
        ConfirmActions.show({
          titleKey,
          titleParams,
          messageKey,
          messageParams,
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
