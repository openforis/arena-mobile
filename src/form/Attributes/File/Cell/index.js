import React from 'react';
import {Text} from 'react-native';

import BaseCell from 'form/Attributes/common/Base/Cell';

const BaseValuesRenderer = ({nodes}) => (
  <Text numberOfLines={1}>
    {nodes.map(node => node?.value?.fileName).join(', ')}
  </Text>
);

const Cell = ({nodeDef, nodes}) => (
  <BaseCell nodes={nodes} nodeDef={nodeDef} ValuesRender={BaseValuesRenderer} />
);

export default Cell;
