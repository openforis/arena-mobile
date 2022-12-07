import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {Text} from 'react-native';

import {Preview as BasePreview} from '../../Base';

import styles from './styles';

const NodeValueRender = ({node, nodeDef}) => {
  const stringValue =
    nodeDef.type === NodeDefType.text
      ? String(node?.value || '')
      : String(isNaN(node?.value) ? '' : node?.value);

  return (
    <Text
      style={[
        nodeDef.type === NodeDefType.text
          ? styles.textAlignLeft
          : styles.textAlignRight,
      ]}>
      {stringValue}
    </Text>
  );
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default Preview;
