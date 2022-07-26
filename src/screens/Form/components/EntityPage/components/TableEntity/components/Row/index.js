import React from 'react';
import {TouchableOpacity} from 'react-native';

import Cell from '../Cell';

import styles from './styles';

const Row = ({item: parentNode, headers, getWidth, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container]}>
      {headers.map(nodeDef => (
        <Cell
          key={`${parentNode.uuid}_${nodeDef.uuid}`}
          parentNode={parentNode}
          nodeDef={nodeDef}
          getWidth={getWidth}
        />
      ))}
    </TouchableOpacity>
  );
};

export default Row;
