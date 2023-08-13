import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import BasePreview from 'form/Attributes/common/Base/Preview';
import surveySelectors from 'state/survey/selectors';

const coordinateText = coordinate =>
  !isNaN(coordinate) && Number(coordinate).toFixed(4);

export const NodeValueRender = ({node, nodeDef}) => {
  const {t} = useTranslation();
  const surveySrs = useSelector(surveySelectors.getSurveySRS);
  const selectedSrs =
    node?.value?.srs && surveySrs.find(srs => srs.code === node.value.srs);

  const items = useMemo(() => {
    return [
      {
        label: t('Form:nodeDefCoordinate.x'),
        value: coordinateText(node?.value?.x),
        thin: true,
        show: true,
      },
      {
        label: t('Form:nodeDefCoordinate.y'),
        value: coordinateText(node?.value?.y),
        thin: true,
        show: true,
      },
      {
        label: t('Form:nodeDefCoordinate.accuracy'),
        value: coordinateText(node?.value?.accuracy),
        thin: true,
        show: nodeDef.props.includeAccuracy,
      },
      {
        label: t('Form:nodeDefCoordinate.altitude'),
        value: coordinateText(node?.value?.altitude),
        thin: true,
        show: nodeDef.props.includeAltitude,
      },
      {
        label: t('Form:nodeDefCoordinate.altitudeAccuracy'),
        value: coordinateText(node?.value?.altitudeAccuracy),
        thin: true,
        show: nodeDef.props.includeAltitudeAccuracy,
      },
      {
        label: t('Form:nodeDefCoordinate.srs'),
        value: selectedSrs?.name,
        thin: true,
        show: true,
      },
    ].filter(item => item.show);
  }, [node, nodeDef, selectedSrs, t]);

  return (
    <LabelsAndValues
      boldLabels={false}
      expanded={true}
      size="m"
      items={items}
    />
  );
};
const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />;
};

export default Preview;
