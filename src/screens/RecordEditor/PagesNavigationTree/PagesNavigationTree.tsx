import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import TreeView from "react-native-final-tree-view";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { HView, ScrollView } from "components";
import { DataEntryActions } from "state";

import { EntityButton } from "./EntityButton";
import { Indicator } from "./Indicator";
import { useTreeData } from "./useTreeData";

const TreeNode = ({
  node: treeNode,
  level,
  isExpanded,
  hasChildrenNodes
}: any) => {
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
    ({
      node
    }: any) => {
      const { entityPointer } = node;
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
      dispatch(DataEntryActions.selectCurrentPageEntity(entityPointer));
    },
    [dispatch]
  );

  return (
    // @ts-expect-error TS(2322): Type '{ children: Element; showsVerticalScrollIndi... Remove this comment to see the full error message
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
