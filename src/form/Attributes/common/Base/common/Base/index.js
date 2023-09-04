import React, {useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {actions as nodesActions} from 'state/nodes';

import BaseContainer from '../BaseContainer';
import BaseNode from '../BaseNode';
import BaseValueRender from '../BaseValueRenderer';
import CreateNode from '../CreateNode';

const BasePreview = ({
  nodeDef,
  NodeValueRender = BaseValueRender,
  keyboardType,
}) => {
  const dispatch = useDispatch();
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const canAddNode = useSelector(state =>
    formSelectors.canAddNode(state, nodeDef),
  );

  const _createNode = useCallback(() => {
    dispatch(nodesActions.createNode({nodeDef, parentNode: parentEntityNode}));
  }, [dispatch, nodeDef, parentEntityNode]);

  useEffect(() => {
    if (nodeDef && parentEntityNode && nodes.length === 0) {
      _createNode();
    }
  }, [dispatch, parentEntityNode, nodeDef, nodes, _createNode]);

  const content = useMemo(() => {
    const numberOfNodes = nodes.length > 1;
    return (
      <>
        {nodes?.map(node => (
          <BaseNode
            key={node.uuid}
            node={node}
            nodeDef={nodeDef}
            showValidation={numberOfNodes}
            NodeValueRender={NodeValueRender}
            canDelete={nodeDef?.props?.multiple}
            parentEntityNode={parentEntityNode}
            keyboardType={keyboardType}
          />
        ))}
        {nodeDef?.props?.multiple && canAddNode && (
          <CreateNode nodeDef={nodeDef} onPress={_createNode} />
        )}
      </>
    );
  }, [
    nodes,
    nodeDef,
    NodeValueRender,
    canAddNode,
    _createNode,
    parentEntityNode,
    keyboardType,
  ]);

  return (
    <BaseContainer nodeDef={nodeDef} nodes={nodes}>
      {content}
    </BaseContainer>
  );
};

export default BasePreview;
