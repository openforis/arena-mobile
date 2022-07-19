import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';

import BaseCell from 'form/Attributes/common/Base/Cell';

const BaseValuesRenderer = ({nodes}) => {
  const node = nodes[0];
  const {t} = useTranslation();
  return (
    <Text numberOfLines={1}>
      {t('Form:nodeDefCoordinate.x')}: {node?.value?.x},{' '}
      {t('Form:nodeDefCoordinate.y')}: {node?.value?.y},{' '}
      {t('Form:nodeDefCoordinate.srs')}: {node?.value?.srs}
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
