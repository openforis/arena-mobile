import { useCallback, useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import TreeView from "react-native-final-tree-view";

import { HView, ScrollView } from "components";
import { DataEntryActions, useAppDispatch } from "state";

import { EntityButton } from "./EntityButton";
import { Indicator } from "./Indicator";
import { useTreeData } from "./useTreeData";

type TreeNodeProps = {
  node: any;
  level: number;
  isExpanded?: boolean;
  hasChildrenNodes?: boolean;
};

const TreeNode = ({
  node: treeNode,
  level,
  isExpanded,
  hasChildrenNodes,
}: TreeNodeProps) => {
  const { isCurrentEntity, isRoot } = treeNode;
  const style: StyleProp<ViewStyle> = useMemo(
    () => ({
      alignItems: "center",
      backgroundColor: "transparent",
      fontSize: 18,
      gap: 2,
      marginLeft: isRoot ? 0 : 20 * (level - 1),
      marginBottom: 6,
    }),
    [isRoot, level]
  );

  return (
    <HView style={style}>
      {!isRoot && (
        <Indicator
          isExpanded={isExpanded}
          hasChildrenNodes={hasChildrenNodes}
        />
      )}
      <EntityButton treeNode={treeNode} isCurrentEntity={isCurrentEntity} />
    </HView>
  );
};

export const PagesNavigationTree = () => {
  const data = useTreeData();
  const dispatch = useAppDispatch();

  const onNodePress = useCallback(
    ({ node }: any) => {
      const { entityPointer } = node;
      dispatch(DataEntryActions.selectCurrentPageEntity(entityPointer));
    },
    [dispatch]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator
      style={{ flex: 1, backgroundColor: "transparent" }}
    >
      <TreeView
        data={data}
        initialExpanded
        onNodePress={onNodePress}
        renderNode={TreeNode}
      />
    </ScrollView>
  );
};
