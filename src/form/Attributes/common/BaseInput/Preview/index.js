import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import AttributeHeader from 'form/common/Header';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles from './styles';

const PreviewNode = ({node}) => {
  const dispatch = useDispatch();

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  return (
    <TouchableOpacity
      style={styles.nodeContainer}
      onPress={handleSelectNodeAndNodeDef}>
      <Text>{node.value || ''}</Text>
    </TouchableOpacity>
  );
};

const Preview = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodes(state, nodeDef),
  );

  return (
    <View style={styles.container}>
      <AttributeHeader nodeDef={nodeDef} />

      {nodes.map(node => (
        <PreviewNode key={node.uuid} node={node} />
      ))}
    </View>
  );
};

export default Preview;
