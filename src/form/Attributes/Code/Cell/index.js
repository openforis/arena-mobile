import React from 'react';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import BaseCell from 'form/Attributes/common/Base/Cell';

import {useCode} from '../Preview/hooks';

const BaseValuesRenderer = ({nodeDef, nodes}) => {
  const {categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  return (
    <TextBase numberOfLines={1}>
      {nodes
        .map(node =>
          getCategoryItemLabel(
            categoryItems.find(
              _categoryItem => _categoryItem.uuid === node?.value?.itemUuid,
            ),
          ),
        )
        .join(',')}
    </TextBase>
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
