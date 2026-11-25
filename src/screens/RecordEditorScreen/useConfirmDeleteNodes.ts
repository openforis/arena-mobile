import { useCallback } from "react";

import { DataEntryActions, useAppDispatch, useConfirm } from "state";

import {
  confirmDeleteNodes,
  ConfirmDeleteNodesParams,
} from "./confirmDeleteNodes";

export const useConfirmDeleteNodes = () => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  return useCallback(
    (params: ConfirmDeleteNodesParams) =>
      confirmDeleteNodes({
        ...params,
        confirm,
        deleteNodes: (nodeUuids) =>
          dispatch(DataEntryActions.deleteNodes(nodeUuids)),
      }),
    [confirm, dispatch],
  );
};
