import React from 'react';
import {useSelector} from 'react-redux';

import {TableCell} from 'arena-mobile-ui/components/Table/components';
import BaseCell from 'form/common/Cell';
import {selectors as formSelectors} from 'state/form';

import styles from './styles';

const Cell = ({parentNode, nodeDef, getWidth}) => {
  const descentantNodes = useSelector(state =>
    formSelectors.getNodeDescendantsByNodeDefUuid(
      state,
      parentNode,
      nodeDef.uuid,
    ),
  );

  return (
    <TableCell width={getWidth(nodeDef)} customStyle={styles.container}>
      <BaseCell nodes={descentantNodes} nodeDef={nodeDef} />
    </TableCell>
  );
};

export default Cell;
