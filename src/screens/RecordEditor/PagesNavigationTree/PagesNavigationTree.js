import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import TreeView from "react-native-final-tree-view";
import PropTypes from "prop-types";

import { HView, ScrollView } from "components";
import { DataEntryActions } from "state";

import { EntityButton } from "./EntityButton";
import { Indicator } from "./Indicator";
import { useTreeData } from "./useTreeData";

const TreeNode = ({ node: treeNode, level, isExpanded, hasChildrenNodes }) => {
  const { isCurrentEntity, isRoot } = treeNode;
  const style = useMemo(
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

TreeNode.propTypes = {
  node: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool,
  hasChildrenNodes: PropTypes.bool,
};

export const PagesNavigationTree = () => {
  const data = useTreeData();
  const dispatch = useDispatch();

  const onNodePress = useCallback(
    ({ node }) => {
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
