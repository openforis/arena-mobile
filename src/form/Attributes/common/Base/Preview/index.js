import React, {useCallback, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import AttributeHeader from 'form/common/Header';
import Validation from 'form/common/Validation';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {actions as nodesActions} from 'state/nodes';

import styles from './styles';

const _useIsActive = () => {
  return true;
};

const BasePreviewNode = ({
  node,
  nodeDef,
  showValidation,
  NodeValueRender,
  useIsActive = _useIsActive,
}) => {
  const dispatch = useDispatch();

  const isActive = useIsActive({node, nodeDef});
  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  return (
    <TouchableOpacity
      style={styles.nodeContainer({nodeDef, isActive})}
      onPress={handleSelectNodeAndNodeDef}
      disabled={!isActive}>
      <NodeValueRender node={node} nodeDef={nodeDef} />
      <Validation
        nodeDef={nodeDef}
        nodes={[node]}
        showValidation={showValidation}
      />
    </TouchableOpacity>
  );
};

const BaseNodeValueRenderer = () => {
  return (
    <View>
      <Text>Not supported</Text>
    </View>
  );
};

const BasePreview = ({
  nodeDef,
  NodeValueRender = BaseNodeValueRenderer,
  useIsActive,
}) => {
  const dispatch = useDispatch();
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const _createNode = useCallback(() => {
    dispatch(nodesActions.createNode({nodeDef, parentNode: parentEntityNode}));
  }, [dispatch, nodeDef, parentEntityNode]);
  useEffect(() => {
    if (nodeDef && parentEntityNode && nodes.length === 0) {
      _createNode();
    }
  }, [dispatch, parentEntityNode, nodeDef, nodes, _createNode]);

  return (
    <View style={styles.container}>
      <AttributeHeader nodeDef={nodeDef} nodes={nodes} />

      {nodes?.map(node => (
        <BasePreviewNode
          key={node.uuid}
          node={node}
          nodeDef={nodeDef}
          showValidation={nodes.length > 1}
          NodeValueRender={NodeValueRender}
          useIsActive={useIsActive}
        />
      ))}
      {nodeDef.props.multiple && <Button onPress={_createNode}>asas</Button>}
    </View>
  );
};

export default BasePreview;
