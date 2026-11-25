export type ConfirmDeleteNodesParams = {
  messageKey: string;
  nodeUuids: string[];
  skipConfirm?: boolean;
};

// resolves to true when the nodes have been deleted
export const confirmDeleteNodes = async ({
  confirm,
  deleteNodes,
  messageKey,
  nodeUuids,
  skipConfirm = false,
}: ConfirmDeleteNodesParams & {
  confirm: (params: { messageKey: string }) => Promise<unknown>;
  deleteNodes: (nodeUuids: string[]) => void;
}): Promise<boolean> => {
  if (!skipConfirm && !(await confirm({ messageKey }))) {
    return false;
  }
  deleteNodes(nodeUuids);
  return true;
};
