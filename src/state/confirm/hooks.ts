import { useCallback } from "react";

import { ConfirmUtils } from "./utils";
import { useAppDispatch } from "state/store";

export const useConfirm = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (params: any) => ConfirmUtils.confirm({ dispatch, ...params }),
    [dispatch]
  );
};
