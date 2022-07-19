import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';

import BasePreview from 'form/Attributes/common/Base/Preview';

const NodeValueRender = ({node, nodeDef}) => {
  const {t} = useTranslation();
  return (
    <Text numberOfLines={1}>
      {t('Form:nodeDefCoordinate.x')}: {node?.value?.x},{' '}
      {t('Form:nodeDefCoordinate.y')}: {node?.value?.y},{' '}
      {t('Form:nodeDefCoordinate.srs')}: {node?.value?.srs}
    </Text>
  );
};
const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />;
};

export default Preview;
