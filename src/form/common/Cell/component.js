import {NodeDefType} from '@openforis/arena-core';
import React from 'react';

import CodeCell from 'form/Attributes/Code/Cell';
import BaseCell from 'form/Attributes/common/Base/Cell';
import CoordinateCell from 'form/Attributes/Coordinate/Cell';
import FileCell from 'form/Attributes/File/Cell';
import TaxonomyCell from 'form/Attributes/Taxonomy/Cell';

const FormsByType = {
  [NodeDefType.integer]: BaseCell,
  [NodeDefType.decimal]: BaseCell,
  [NodeDefType.text]: BaseCell,
  [NodeDefType.boolean]: BaseCell,
  [NodeDefType.date]: BaseCell,
  [NodeDefType.time]: BaseCell,
  [NodeDefType.code]: CodeCell,
  [NodeDefType.file]: FileCell,
  [NodeDefType.coordinate]: CoordinateCell,
  [NodeDefType.taxon]: TaxonomyCell,
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
