import React from 'react';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import BaseCell from 'form/Attributes/common/Base/Cell';
import {selectors as surveySelectors} from 'state/survey';

const BaseValuesRenderer = ({nodes}) => {
  const node = nodes[0];

  const taxonItem = useSelector(state =>
    surveySelectors.getTaxonomyItemByUuid(state, node?.value?.taxonUuid),
  );
  return (
    <TextBase numberOfLines={1}>
      {taxonItem?.props?.code} - {taxonItem?.props?.genus}
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
