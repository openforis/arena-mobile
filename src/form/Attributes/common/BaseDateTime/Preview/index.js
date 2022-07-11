import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {Text} from 'react-native';

import {Preview as BasePreview} from '../../Base';

const placeHolder = {
  [NodeDefType.time]: 'HH:MM',
  [NodeDefType.date]: 'YYYY-MM-DD',
};
const NodeValueRender = ({node, nodeDef}) => {
  return <Text>{node.value || placeHolder[nodeDef.type]}</Text>;
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default Preview;
