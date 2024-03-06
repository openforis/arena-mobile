import React from 'react';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import BaseCell from 'form/Attributes/common/Base/Cell';

const BaseValuesRenderer = ({nodes}) => (
  <TextBase numberOfLines={1}>
    {nodes?.map(node => node?.value?.fileName).join(', ')}
  </TextBase>
);

const Cell = ({nodeDef, nodes}) => (
  <BaseCell nodes={nodes} nodeDef={nodeDef} ValuesRender={BaseValuesRenderer} />
);

export default Cell;
