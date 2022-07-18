import React from 'react';

import Cell from '../Cell';

const Row = ({item: parentNode, headers, getWidth}) => {
  return (
    <>
      {headers.map(nodeDef => (
        <Cell
          key={`${parentNode.uuid}_${nodeDef.uuid}`}
          parentNode={parentNode}
          nodeDef={nodeDef}
          getWidth={getWidth}
        />
      ))}
    </>
  );
};

export default Row;
