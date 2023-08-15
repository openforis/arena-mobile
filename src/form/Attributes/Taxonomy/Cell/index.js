import React from 'react';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import BaseCell from 'form/Attributes/common/Base/Cell';
import {selectors as surveySelectors} from 'state/survey';

import {useTaxonItemLabelExtractor} from '../hooks';

const BaseValuesRenderer = ({nodeDef, nodes}) => {
  const node = nodes[0];

  const labelExtractor = useTaxonItemLabelExtractor(nodeDef);

  const taxonItem = useSelector(state =>
    surveySelectors.getTaxonomyItemByUuid(state, node?.value?.taxonUuid),
  );
  return <TextBase numberOfLines={1}>{labelExtractor(taxonItem)}</TextBase>;
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
