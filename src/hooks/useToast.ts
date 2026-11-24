import { useCallback } from "react";

import { useAppDispatch } from "state/storeHooks";
import { ToastActions } from "state/toast";

export const useToast = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (textKey: string, textParams: Record<string, unknown> = {}) => {
      dispatch(ToastActions.show(textKey, textParams));
    },
    [dispatch],
  );
};
