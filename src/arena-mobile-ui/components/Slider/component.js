import {Slider} from '@miblanchard/react-native-slider';
import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const SliderComponent = ({
  title,
  info,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  onReset,
  resetLabel,
  LeftComponent,
  RightComponent,
  customTitleStyle,
  customInfoStyle,
  customSliderContainerStyle,
  disabled,
  isSingle,
}) => {
  const styles = useThemedStyles(_styles);

  const titleStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.title, customTitleStyle),
    );
  }, [styles, customTitleStyle]);

  const infoStyle = useMemo(() => {
    return StyleSheet.compose(StyleSheet.compose(styles.info, customInfoStyle));
  }, [styles, customInfoStyle]);

  const sliderContainerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.sliderContainer, customSliderContainerStyle),
    );
  }, [styles, customSliderContainerStyle]);

  const handleChange = useCallback(
    _value => {
      let __value = _value;
      if (isSingle) {
        __value = Array.isArray(_value) ? _value[0] : _value;
      }
      onValueChange(__value);
    },
    [onValueChange, isSingle],
  );

  return (
    <>
      <TextBase type="header" customStyle={titleStyle}>
        {title}
      </TextBase>

      <TextBase type="secondary" customStyle={infoStyle}>
        {info}
      </TextBase>

      <View style={styles.selectorContainer}>
        {LeftComponent}
        <View style={sliderContainerStyle}>
          <Slider
            value={value}
            onValueChange={handleChange}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
            disabled={disabled}
          />
        </View>
        {RightComponent}
      </View>

      {resetLabel && (
        <Button type="ghost" onPress={onReset} label={resetLabel} />
      )}
    </>
  );
};

SliderComponent.defaultProps = {
  isSingle: true,
};

export default SliderComponent;
