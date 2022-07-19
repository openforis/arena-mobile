import React from 'react';
import {View, Text} from 'react-native';

import Validation from 'form/common/Validation';

import styles from './styles';

const BaseValuesRenderer = ({nodes}) => {
  return (
    <Text numberOfLines={1}>{nodes.map(node => node.value).join(',')}</Text>
  );
};

const Cell = ({nodeDef, nodes, ValuesRender = BaseValuesRenderer}) => {
  return (
    <View style={[styles.container({nodeDef})]}>
      <Validation nodeDef={nodeDef} nodes={nodes} showValidation={true} />
      {nodes.length > 0 && <ValuesRender nodes={nodes} nodeDef={nodeDef} />}
    </View>
  );
};

export default Cell;
