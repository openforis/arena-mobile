import React from 'react';

import Pressable from 'arena-mobile-ui/components/Pressable';

import Cell from '../Cell';

import styles from './styles';

const Row = ({item: parentNode, headers, getWidth, onPress}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {headers.map(nodeDef => (
        <Cell
          key={`${parentNode.uuid}_${nodeDef.uuid}`}
          parentNode={parentNode}
          nodeDef={nodeDef}
          getWidth={getWidth}
        />
      ))}
    </Pressable>
  );
};

export default Row;
