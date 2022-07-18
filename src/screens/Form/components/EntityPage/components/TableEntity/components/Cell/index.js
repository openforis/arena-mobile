import React from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import {TableCell} from 'arena-mobile-ui/components/Table/components';
import {selectors as formSelectors} from 'state/form';

const Cell = ({parentNode, nodeDef, getWidth}) => {
  const descentantNodes = useSelector(state =>
    formSelectors.getNodeDescendantsByNodeDefUuid(
      state,
      parentNode,
      nodeDef.uuid,
    ),
  );

  return (
    <TableCell
      width={getWidth(nodeDef)}
      customStyle={{alignItems: 'flex-start'}}>
      {descentantNodes.length > 0 && (
        <Text numberOfLines={1}>
          {descentantNodes.map(descendant => descendant.value).join(',')}
        </Text>
      )}
    </TableCell>
  );
};

export default Cell;
