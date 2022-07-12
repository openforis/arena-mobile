import React from 'react';
import {Text} from 'react-native';

import {Preview as BasePreview} from '../../Base';

const NodeValueRender = ({node}) => {
  return <Text>{node.value || ''}</Text>;
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default Preview;
