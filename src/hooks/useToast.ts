import { useCallback } from "react";
import { useDispatch } from "react-redux";

// @ts-expect-error TS(2307): Cannot find module 'state/toast' or its correspond... Remove this comment to see the full error message
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
