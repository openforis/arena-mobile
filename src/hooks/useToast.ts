import { useCallback } from "react";

import { useAppDispatch } from "state/store";
import { ToastActions } from "state/toast";

export const useToast = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (textKey: any, textParams = {}) => {
      dispatch(ToastActions.show(textKey, textParams));
    },
    [dispatch]
  );
};
