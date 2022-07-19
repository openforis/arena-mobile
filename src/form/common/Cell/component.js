import {NodeDefType} from '@openforis/arena-core';
import React from 'react';

import CodeCell from 'form/Attributes/Code/Cell';
import BaseCell from 'form/Attributes/common/Base/Cell';

const FormsByType = {
  [NodeDefType.integer]: BaseCell,
  [NodeDefType.decimal]: BaseCell,
  [NodeDefType.text]: BaseCell,
  [NodeDefType.boolean]: BaseCell,
  [NodeDefType.date]: BaseCell,
  [NodeDefType.time]: BaseCell,
  [NodeDefType.code]: CodeCell,
};

const Cell = ({nodeDef, nodes}) => {
  return (
    <>
      {nodeDef &&
        React.createElement(FormsByType[nodeDef?.type] || BaseCell, {
          nodeDef,
          nodes,
        })}
    </>
  );
};

export default Cell;
