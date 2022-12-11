import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import Validation from 'form/common/Validation';
import {selectors as formSelectors} from 'state/form';

import styles from './styles';

const BaseValuesRenderer = ({nodes}) => {
  return (
    <Text numberOfLines={1}>{nodes.map(node => node.value).join(',')}</Text>
  );
};

const Cell = ({nodeDef, nodes, ValuesRender = BaseValuesRenderer}) => {
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  return (
    <View style={[styles.container({nodeDef, applicable})]}>
      <Validation nodeDef={nodeDef} nodes={nodes} showValidation={true} />
      {nodes.length > 0 && (
        <ValuesRender nodes={nodes} nodeDef={nodeDef} applicable={applicable} />
      )}
    </View>
  );
};

export default Cell;
