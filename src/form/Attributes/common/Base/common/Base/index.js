import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {actions as nodesActions} from 'state/nodes';

import BaseContainer from '../BaseContainer';
import BaseNode from '../BaseNode';
import BaseValueRender from '../BaseValueRenderer';
import CreateNode from '../CreateNode';
import {Objects, compareArraysAsSets} from 'infra/objectUtils';

const Container = ({children, nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return (
    <BaseContainer nodeDef={nodeDef} nodes={nodes}>
      {children}
    </BaseContainer>
  );
};

const useNodesUuids = nodeDef =>
  useSelector(state => {
    const nodes = formSelectors.getNodeDefNodesInHierarchy(state, nodeDef);
    return nodes?.map(node => node.uuid);
  }, compareArraysAsSets);

const BasePreview = ({
  nodeDef,
  NodeValueRender = BaseValueRender,
  keyboardType,
}) => {
  const dispatch = useDispatch();
  const nodesUuids = useNodesUuids(nodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const canAddNode = useSelector(state =>
    formSelectors.canAddNode(state, nodeDef),
  );

  const _createNode = useCallback(() => {
    dispatch(nodesActions.createNode({nodeDef, parentNode: parentEntityNode}));
  }, [dispatch, nodeDef, parentEntityNode]);

  useEffect(() => {
    if (
      nodeDef &&
      parentEntityNode &&
      Array.isArray(nodesUuids) &&
      nodesUuids?.length === 0
    ) {
      _createNode();
    }
  }, [dispatch, parentEntityNode, nodeDef, nodesUuids, _createNode]);

  const content = useMemo(() => {
    const numberOfNodes = nodesUuids?.length > 1;
    return (
      <>
        {nodesUuids?.map(nodeUuid => (
          <BaseNode
            key={nodeUuid}
            nodeUuid={nodeUuid}
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
    nodesUuids,
    nodeDef,
    NodeValueRender,
    canAddNode,
    _createNode,
    parentEntityNode,
    keyboardType,
  ]);

  if (Objects.isEmpty(nodesUuids)) {
    return <></>;
  }
  return <Container nodeDef={nodeDef}>{content}</Container>;
};

export default BasePreview;
