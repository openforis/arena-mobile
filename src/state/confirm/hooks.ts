import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { ConfirmUtils } from "./utils";

export const useConfirm = () => {
  const dispatch = useDispatch();

  return useCallback(
    (params) => ConfirmUtils.confirm({ dispatch, ...params }),
    [dispatch]
  );
};
