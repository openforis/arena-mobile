import { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  TreeView,
  type NodeRowProps,
  type TreeViewRef,
} from "react-native-tree-multi-select";

import { HView } from "components";

import { EntityButton } from "./EntityButton";
import { Indicator } from "./Indicator";
import { TreeLines } from "./TreeLines";
import { useTreeData } from "./useTreeData";

const TreeNodeRow = ({
  node: treeNode,
  level,
  isExpanded,
  onExpand,
}: NodeRowProps) => {
  const { isCurrentEntity, isRoot, children } = treeNode;
  const hasChildrenNodes = (children?.length ?? 0) > 0;

  return (
    <HView style={styles.row}>
      <TreeLines level={level} />
      {!isRoot && (
        <TouchableOpacity onPress={onExpand} disabled={!hasChildrenNodes}>
          <Indicator isExpanded={isExpanded} hasChildrenNodes={hasChildrenNodes} />
        </TouchableOpacity>
      )}
      <EntityButton treeNode={treeNode} isCurrentEntity={isCurrentEntity} />
    </HView>
  );
};

export const PagesNavigationTree = () => {
  const data = useTreeData();
  const treeRef = useRef<TreeViewRef>(null);

  useEffect(() => {
    treeRef.current?.expandAll();
  }, []);

  return (
    <TreeView
      ref={treeRef}
      data={data}
      CustomNodeRowComponent={TreeNodeRow}
      selectionPropagation={{ toChildren: false, toParents: false }}
      treeFlashListProps={{ style: { flex: 1 } }}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: "transparent",
    gap: 0,
    marginBottom: 6,
  },
});
