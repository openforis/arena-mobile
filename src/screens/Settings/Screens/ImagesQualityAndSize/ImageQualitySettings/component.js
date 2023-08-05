import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import Slider from 'arena-mobile-ui/components/Slider';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const MIN = 200;
const MAX = 4032;

const SettingsImagesQualityAndSize = () => {
  const dispatch = useDispatch();
  const styles = useThemedStyles(_styles);
  const isMaxResolution = useSelector(appSelectors.getIsMaxResolution);

  const compressQuality = useSelector(appSelectors.getImagesCompressQuality);
  const compressMaxHeight = useSelector(
    appSelectors.getImagesCompressMaxHeight,
  );
  const compressMaxWidth = useSelector(appSelectors.getImagesCompressMaxWidth);

  const {t} = useTranslation();

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      isMaxResolution && styles.disabled,
    );
  }, [styles, isMaxResolution]);

  const handleSetCompresMaxHeight = useCallback(
    value => {
      dispatch(
        appActions.setImagesCompressMaxHeight({
          compressMaxHeight: value,
        }),
      );
    },
    [dispatch],
  );

  const handleSetCompresMaxWidth = useCallback(
    value => {
      dispatch(
        appActions.setImagesCompressMaxWidth({
          compressMaxWidth: value,
        }),
      );
    },
    [dispatch],
  );

  const handleSetCompresQuality = useCallback(
    value => {
      dispatch(
        appActions.setImagesCompressQuality({
          compressQuality: value,
        }),
      );
    },
    [dispatch],
  );
  const maxText = useMemo(() => {
    return t('Common:max');
  }, [t]);

  return (
    <View style={containerStyle}>
      <Slider
        title={t('Settings:images_quality_and_size.screen.quality.label', {
          value: isMaxResolution
            ? maxText
            : Number(compressQuality * 100).toFixed(0),
          subfix: isMaxResolution ? '' : '%',
        })}
        info={t('Settings:images_quality_and_size.screen.quality.info')}
        value={isMaxResolution ? 1 : compressQuality}
        onValueChange={handleSetCompresQuality}
        minimumValue={0}
        maximumValue={1}
        customSliderContainerStyle={styles.sliderContainer}
        disabled={isMaxResolution}
      />

      <Slider
        title={t('Settings:images_quality_and_size.screen.max_width.label', {
          value: isMaxResolution
            ? maxText
            : Number(compressMaxHeight).toFixed(0),
          subfix: isMaxResolution ? '' : 'px',
        })}
        info={t('Settings:images_quality_and_size.screen.max_width.info', {
          from: MIN,
          to: MAX,
        })}
        value={isMaxResolution ? MAX : compressMaxHeight}
        onValueChange={handleSetCompresMaxHeight}
        minimumValue={MIN}
        maximumValue={MAX}
        customSliderContainerStyle={styles.sliderContainer}
        disabled={isMaxResolution}
      />

      <Slider
        title={t('Settings:images_quality_and_size.screen.max_height.label', {
          value: isMaxResolution
            ? maxText
            : Number(compressMaxWidth).toFixed(0),
          subfix: isMaxResolution ? '' : 'px',
        })}
        info={t('Settings:images_quality_and_size.screen.max_height.info', {
          from: MIN,
          to: MAX,
        })}
        value={isMaxResolution ? MAX : compressMaxWidth}
        onValueChange={handleSetCompresMaxWidth}
        minimumValue={MIN}
        maximumValue={MAX}
        disabled={isMaxResolution}
      />
    </View>
  );
};

export default SettingsImagesQualityAndSize;
