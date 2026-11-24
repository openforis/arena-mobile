import { useCallback } from "react";

import { ConfirmUtils } from "./utils";
import { useAppDispatch } from "state/storeHooks";

type ConfirmParams = Omit<
  Parameters<typeof ConfirmUtils.confirm>[0],
  "dispatch"
>;

export const useConfirm = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (params: ConfirmParams) => ConfirmUtils.confirm({ dispatch, ...params }),
    [dispatch],
  );
};
