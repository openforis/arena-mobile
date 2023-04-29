import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {Text} from 'react-native';

import {Preview as BasePreview} from '../../Base';
import {getValueAsString} from '../Form';

import styles from './styles';

const NodeValueRender = ({node, nodeDef}) => {
  return (
    <Text
      style={[
        styles.text,
        nodeDef.type === NodeDefType.text
          ? styles.textAlignLeft
          : styles.textAlignRight,
      ]}>
      {getValueAsString(nodeDef, node)}
    </Text>
  );
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default Preview;
