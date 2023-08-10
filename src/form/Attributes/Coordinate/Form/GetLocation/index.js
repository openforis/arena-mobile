import {PointFactory, Points} from '@openforis/arena-core';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet, Animated} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import {useSkeletonAnimation} from 'arena-mobile-ui/components/List/Loading/component';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
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

const _sorter = (a, b) => (a > b ? 1 : a === b ? 0 : -1);

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
        .sort(_sorter)
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

  const {location, getLocation, loading} = useGetLocation();

  const _handleSaveLocation = useCallback(() => {
    if (location) {
      handleSaveLocation(location);
    }
  }, [location, handleSaveLocation]);

  useEffect(() => {
    _handleSaveLocation();
  }, [_handleSaveLocation]);

  return (
    <View style={styles.container}>
      {!loading && (
        <Button
          type="ghostBlack"
          icon={<Icon name="compass-outline" />}
          onPress={getLocation}
          label={t('Form:get_location')}
          customTextStyle={styles.customTextStyle}
          disabled={loading}
        />
      )}

      <LabelsAndValues items={prepareItems(location, {selectedSrs})} expanded />

      {loading && location && (
        <LocationAccuracyBar accuracy={location?.coords?.accuracy} />
      )}
    </View>
  );
};

const COLORS = ['#ed5b46', '#d97631', '#eaa200', '#e1b400', '#94f94b'];
const ACCURACY_STEPS = [15, 19, 20, 40, 50];

const _getIndex = ({accuracy, accuracySteps}) => {
  const accuracyIndex = accuracySteps.findIndex(step => accuracy <= step);
  if (accuracyIndex >= 0) {
    return Math.max(accuracySteps.length - 1 - accuracyIndex, 0);
  }
  return 0;
};

const AccuracyPill = ({index, first, last, accuracyIndex}) => {
  const styles = useThemedStyles(_styles);

  const opacityAnim = useSkeletonAnimation();

  const pillStyle = useMemo(() => {
    return StyleSheet.flatten([
      styles.accuracyPill,
      ...(accuracyIndex >= index
        ? [{backgroundColor: COLORS[accuracyIndex]}]
        : []),
      ...(first ? [styles.accuracyPillFirst] : []),
      ...(last ? [styles.accuracyPillLast] : []),
    ]);
  }, [styles, accuracyIndex, index, first, last]);

  if (accuracyIndex === index) {
    return (
      <Animated.View style={{opacity: opacityAnim}}>
        <View style={pillStyle} />
      </Animated.View>
    );
  }
  return <View style={pillStyle} />;
};

const LocationAccuracyBar = ({accuracy}) => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();

  const accuracyIndex = _getIndex({accuracy, accuracySteps: ACCURACY_STEPS});
  return (
    <View style={styles.accuracyBarContainer}>
      <View style={styles.accuracyIconContainer}>
        {accuracyIndex < 4 ? (
          <BlinkingIconWithOpacityAnimation
            name="satellite-variant"
            customStyle={styles.locationIcon}
            color={COLORS[accuracyIndex]}
          />
        ) : (
          <Icon
            name="satellite-variant"
            customStyle={styles.locationIcon}
            color={COLORS[accuracyIndex]}
          />
        )}
      </View>

      <View style={styles.accuracyPayload}>
        <View>
          <TextBase>
            {t('Form:nodeDefCoordinate.accuracy')}:{' '}
            {String(accuracy.toFixed(3))}
          </TextBase>
        </View>
        <View style={styles.accuracyBar}>
          {[0, 1, 2, 3, 4].map((pillIndex, i) => (
            <AccuracyPill
              key={pillIndex}
              index={pillIndex}
              first={i === 0}
              last={i === 4}
              accuracyIndex={accuracyIndex}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const BlinkingIconWithOpacityAnimation = ({name, customStyle, color}) => {
  const opacityAnim = useSkeletonAnimation();

  return (
    <Animated.View style={{opacity: opacityAnim}}>
      <Icon name={name} customStyle={customStyle} color={color} />
    </Animated.View>
  );
};

export default GetLocation;
