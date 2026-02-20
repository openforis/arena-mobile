import { useCallback } from "react";

import { ConfirmAsyncParams, ConfirmUtils } from "./utils";
import { useAppDispatch } from "state/store";

export const useConfirm = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (params: Omit<ConfirmAsyncParams, "dispatch">) =>
      ConfirmUtils.confirm({ dispatch, ...params }),
    [dispatch],
  );
};
