import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import BasePreview from 'form/Attributes/common/Base/Preview';
import surveySelectors from 'state/survey/selectors';

const coordinateText = coordinate =>
  !isNaN(coordinate) && Number(coordinate).toFixed(4);
export const NodeValueRender = ({node}) => {
  const {t} = useTranslation();
  const surveySrs = useSelector(surveySelectors.getSurveySRS);
  const selectedSrs =
    node?.value?.srs && surveySrs.find(srs => srs.code === node?.value?.srs);
  return (
    <Text numberOfLines={1}>
      {t('Form:nodeDefCoordinate.x')}: {coordinateText(node?.value?.x)},{' '}
      {t('Form:nodeDefCoordinate.y')}: {coordinateText(node?.value?.y)},{' '}
      {t('Form:nodeDefCoordinate.srs')}: {selectedSrs?.name}
    </Text>
  );
};
const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />;
};

export default Preview;
