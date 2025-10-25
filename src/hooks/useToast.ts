import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { ToastActions } from "state/toast";

export const useToast = () => {
  const dispatch = useDispatch();

  return useCallback(
    (textKey: any, textParams = {}) => {
      dispatch(ToastActions.show(textKey, textParams));
    },
    [dispatch]
  );
};
