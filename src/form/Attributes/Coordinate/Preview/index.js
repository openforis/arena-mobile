import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import openMap from 'react-native-open-maps';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import BasePreview from 'form/Attributes/common/Base/Preview';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

const coordinateText = coordinate =>
  !isNaN(coordinate) && Number(coordinate).toFixed(4);

const OpenInMap = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const handleOpenMap = () => {
    const {x, y} = nodes[0].value;
    openMap({
      query: `${y},${x}`,
    });
  };

  return (
    <View>
      <Button
        onPress={handleOpenMap}
        type="ghostBlack"
        label="Open in map"
        icon={<Icon name="map" size="s" />}
      />
    </View>
  );
};

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
  return (
    <>
      <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
      <OpenInMap nodeDef={nodeDef} />
    </>
  );
};

export default Preview;
