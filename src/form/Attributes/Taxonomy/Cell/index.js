import React from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import BaseCell from 'form/Attributes/common/Base/Cell';
import {selectors as surveySelectors} from 'state/survey';

const BaseValuesRenderer = ({nodes}) => {
  const node = nodes[0];

  const taxonItem = useSelector(state =>
    surveySelectors.getTaxonomyItemByUuid(state, node?.value?.taxonUuid),
  );
  return (
    <Text numberOfLines={1}>
      {taxonItem?.props?.code} - {taxonItem?.props?.genus}
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
