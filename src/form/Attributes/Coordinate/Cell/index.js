import React from 'react';

import BaseCell from 'form/Attributes/common/Base/Cell';

import {NodeValueRender} from '../Preview';
const BaseValuesRenderer = ({nodes}) => {
  const node = nodes[0];
  return <NodeValueRender node={node} />;
};

const Cell = ({nodeDef, nodes}) => {
  return (
    <BaseCell
      nodes={nodes}
      nodeDef={nodeDef}
      ValuesRender={BaseValuesRenderer}
    />
  );
};

export default Cell;
