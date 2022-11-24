import {PointFactory, Points} from '@openforis/arena-core';
import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';

import useGetLocation from '../useGetLocation';

import styles from './styles';

const DEFAULT_SRS_CODE = '4326';

const prepareItems = (location, {selectedSrs}) => {
  if (location?.coords) {
    const srs = DEFAULT_SRS_CODE;
    const accuracy = location.coords.accuracy;
    const x = Number(location.coords.longitude);
    const y = Number(location.coords.latitude);

    const point = PointFactory.createInstance({
      srs,
      x,
      y,
    });
    const transformedPoint = Points.transform(point, selectedSrs.code);
    const pareparedFields = ['longitude', 'latitude', 'accuracy'];

    return [
      {
        label: 'Accuracy',
        value: String(accuracy.toFixed(3)),
        bolder: true,
      },
      {
        label: 'X',
        value: String(transformedPoint.x.toFixed(6)),
      },
      {
        label: 'Y',
        value: String(transformedPoint.y.toFixed(6)),
      },
      {
        label: 'srs',
        value: selectedSrs.code,
      },
    ].concat(
      Object.keys(location?.coords || {})
        .filter(key => !pareparedFields.includes(key))
        .sort()
        .map(key => ({
          label: key,
          value: String(location?.coords[key].toFixed(2)),
        })),
    );
  }
  return [];
};

const GetLocation = ({handleSaveLocation, selectedSrs}) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const {location, getLocation} = useGetLocation();

  const _handleSaveLocation = useCallback(() => {
    setLoading(true);
    handleSaveLocation(location);
  }, [location, handleSaveLocation]);

  useEffect(() => {
    setLoading(false);
  }, [location]);

  return (
    <View style={styles.container}>
      <Button
        type="ghostBlack"
        icon={<Icon name="compass-outline" />}
        onPress={getLocation}
        label={t('Form:get_location')}
        customTextStyle={styles.customTextStyle}
        disabled={loading}
      />
      <LabelsAndValues items={prepareItems(location, {selectedSrs})} expanded />
      {location?.coords && (
        <Button
          type="ghost"
          label={t('Form:nodeDefCoordinate.use')}
          customContainerStyle={styles.customContainerStyle}
          onPress={_handleSaveLocation}
        />
      )}
    </View>
  );
};

export default GetLocation;
