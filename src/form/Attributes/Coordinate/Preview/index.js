import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, View} from 'react-native';
import openMap from 'react-native-open-maps';
import {useSelector} from 'react-redux';

import {NodeDefs} from '@openforis/arena-core';
import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import BasePreview from 'form/Attributes/common/Base/Preview';
import {Objects} from 'infra/objectUtils';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

import appSelectors from 'state/app/selectors';

import _styles from './styles';
import {generateShortShowMapUrl} from 'infra/navigation/mapsme';
const coordinateText = coordinate =>
  !isNaN(coordinate) && Number(coordinate).toFixed(4);

const CoordinateButtons = ({nodeDef, handleCleanCoordinates}) => {
  const styles = useThemedStyles(_styles);
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const hasToUseMapsMeAsDefault = useSelector(
    appSelectors.hasToUseMapsMeAsDefault,
  );

  const isReadOnly = Objects.isEmpty(nodeDef)
    ? true
    : NodeDefs.isReadOnly(nodeDef);

  const handleOpenMap = () => {
    console.log(nodes[0].value);
    const {x, y} = nodes[0].value;
    if (hasToUseMapsMeAsDefault) {
      const url = generateShortShowMapUrl(Number(y), Number(x), 15, 'Location');
      Linking.openURL(url);
    } else {
      openMap({
        query: `${y},${x}`,
      });
    }
  };

  if (
    Objects.isEmpty(nodes[0]?.value?.x) ||
    Objects.isEmpty(nodes[0]?.value?.y)
  ) {
    return null;
  }

  return (
    <View style={styles.buttonsContainer}>
      <Button
        onPress={handleOpenMap}
        type="ghostBlack"
        label="Open in map"
        icon={<Icon name="map" size="s" />}
      />
      {!isReadOnly && (
        <Button
          onPress={handleCleanCoordinates}
          type="ghostBlack"
          icon={<Icon name="trash-can-outline" size="s" />}
        />
      )}
    </View>
  );
};

export const NodeValueRender = ({node, nodeDef}) => {
  const {t} = useTranslation();
  const surveySrsIndex = useSelector(surveySelectors.getSurveySRSIndex);
  const selectedSrs = node?.value?.srs && surveySrsIndex[node.value.srs];

  const {handleClean} = useNodeFormActions({
    nodeDef,
  });
  const handleCleanCoordinates = useCallback(() => {
    handleClean({node});
  }, [handleClean, node]);

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
        show: nodeDef?.props.includeAccuracy,
      },
      {
        label: t('Form:nodeDefCoordinate.altitude'),
        value: coordinateText(node?.value?.altitude),
        thin: true,
        show: nodeDef?.props.includeAltitude,
      },
      {
        label: t('Form:nodeDefCoordinate.altitudeAccuracy'),
        value: coordinateText(node?.value?.altitudeAccuracy),
        thin: true,
        show: nodeDef?.props.includeAltitudeAccuracy,
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
    <>
      <LabelsAndValues
        boldLabels={false}
        expanded={true}
        size="m"
        items={items}
      />
      <CoordinateButtons
        nodeDef={nodeDef}
        handleCleanCoordinates={handleCleanCoordinates}
      />
    </>
  );
};
const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />;
};

export default Preview;
