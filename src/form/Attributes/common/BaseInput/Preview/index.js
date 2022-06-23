import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import AttributeHeader from 'form/common/Header';
import Validation from 'form/common/Validation';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles from './styles';

const PreviewNode = ({node, nodeDef, showValidation}) => {
  const dispatch = useDispatch();

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  return (
    <TouchableOpacity
      style={styles.nodeContainer}
      onPress={handleSelectNodeAndNodeDef}>
      <Text>{node.value || ''}</Text>
      <Validation
        nodeDef={nodeDef}
        nodes={[node]}
        showValidation={showValidation}
      />
    </TouchableOpacity>
  );
};

const Preview = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return (
    <View style={styles.container}>
      <AttributeHeader nodeDef={nodeDef} nodes={nodes} />

      {nodes?.map(node => (
        <PreviewNode
          key={node.uuid}
          node={node}
          nodeDef={nodeDef}
          showValidation={nodes.length > 1}
        />
      ))}
    </View>
  );
};

export default Preview;
