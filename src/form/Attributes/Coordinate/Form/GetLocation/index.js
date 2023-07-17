import {PointFactory, Points} from '@openforis/arena-core';
import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import useGetLocation from '../useGetLocation';

import _styles from './styles';

const DEFAULT_SRS_CODE = '4326';

export const toFixedIfLongerAndNumber = (value, decimals = 3) => {
  if (typeof value === 'number') {
    if (value.toString().length > decimals) {
      return String(value.toFixed(decimals));
    }
    return value;
  }
  return value;
};

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
        value: toFixedIfLongerAndNumber(accuracy),
        bolder: true,
      },
      {
        label: 'X',
        value: toFixedIfLongerAndNumber(transformedPoint.x, 6),
      },
      {
        label: 'Y',
        value: toFixedIfLongerAndNumber(transformedPoint.y, 6),
      },
      {
        label: 'srs',
        value: selectedSrs.code,
      },
    ].concat(
      Object.keys(location?.coords || {})
        .filter(key => !pareparedFields.includes(key))
        .sort((a, b) => (a > b ? 1 : a === b ? 0 : -1))
        .map(key => ({
          label: key,
          value: toFixedIfLongerAndNumber(location?.coords[key], 2),
        })),
    );
  }
  return [];
};

const GetLocation = ({handleSaveLocation, selectedSrs}) => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const {location, getLocation} = useGetLocation();

  const _handleSaveLocation = useCallback(() => {
    if (location) {
      setLoading(true);
      handleSaveLocation(location);
    }
  }, [location, handleSaveLocation]);

  useEffect(() => {
    setLoading(false);
  }, [location]);

  useEffect(() => {
    _handleSaveLocation();
  }, [_handleSaveLocation]);

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
      {location && (
        <LocationAccuracyBar accuracy={location?.coords?.accuracy} />
      )}
      {location?.coords && false && (
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

const LocationAccuracyBar = ({accuracy}) => {
  const styles = useThemedStyles(_styles);

  const accuracyWidth = accuracy ? (50 - accuracy) * 2 : 100;

  const color = accuracy < 10 ? 'green' : accuracy < 20 ? 'orange' : 'red';
  return (
    <View style={styles.accuracyBarContainer}>
      <View style={styles.accuracyBar}>
        <View
          style={[
            styles.accuracyBarFill,
            {width: `${accuracyWidth}%`, backgroundColor: color},
          ]}
        />
      </View>
      <AccuracyBarText accuracy={accuracy} />
      <AccuracyBarSpinner />
    </View>
  );
};

const AccuracyBarText = ({accuracy}) => {
  const styles = useThemedStyles(_styles);

  return (
    <View style={styles.accuracyBarTextContainer}>
      <Text style={styles.accuracyBarText}>{String(accuracy.toFixed(3))}</Text>
    </View>
  );
};

const AccuracyBarSpinner = () => {
  const styles = useThemedStyles(_styles);

  return <View style={styles.accuracyBarSpinnerContainer} />;
};

export default GetLocation;
