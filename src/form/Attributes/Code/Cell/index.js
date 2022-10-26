import React from 'react';
import {Text} from 'react-native';

import BaseCell from 'form/Attributes/common/Base/Cell';

import {useCode, getCategoryItemLabel} from '../Preview/hooks';

const BaseValuesRenderer = ({nodeDef, nodes}) => {
  const {language, categoryItems} = useCode({
    nodeDef,
  });

  return (
    <Text numberOfLines={1}>
      {nodes
        .map(node =>
          getCategoryItemLabel(nodeDef)({
            categoryItem: categoryItems.find(
              _categoryItem => _categoryItem.uuid === node?.value?.itemUuid,
            ),
            language,
          }),
        )
        .join(',')}
    </Text>
  );
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
