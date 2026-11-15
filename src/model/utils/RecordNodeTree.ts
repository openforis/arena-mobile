import { ArenaRecord, ArenaRecordNode, Records } from "@openforis/arena-core";

const getSiblingNode = ({
  record,
  parentEntity,
  node,
  offset,
}: {
  record: ArenaRecord;
  parentEntity: ArenaRecordNode | undefined;
  node: ArenaRecordNode;
  offset: number;
}): { siblingNode: ArenaRecordNode | undefined; siblingIndex: number } => {
  const siblingNodes = Records.getChildren(
    parentEntity!,
    node.nodeDefUuid,
  )(record);
  const nodeIndex = siblingNodes.indexOf(node);
  const siblingIndex = nodeIndex + offset;
  const siblingNode = siblingNodes[siblingIndex];
  return { siblingNode, siblingIndex };
};

const findAncestor = (params: {
  record: ArenaRecord;
  node: ArenaRecordNode;
  predicate: (node: ArenaRecordNode) => boolean;
}): ArenaRecordNode | null => {
  const { record, node, predicate } = params;
  let result: ArenaRecordNode | null = null;
  Records.visitAncestorsAndSelf(node, (visitedAncestor) => {
    if (predicate(visitedAncestor)) {
      result = visitedAncestor;
      return true;
    }
    return false;
  })(record);
  return result;
};

export const RecordNodeTree = {
  getSiblingNode,
  findAncestor,
};
