import {Slider} from '@miblanchard/react-native-slider';
import React, {useMemo} from 'react';
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
            onValueChange={onValueChange}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
          />
        </View>
        {RightComponent}
      </View>

      <Button type="ghost" onPress={onReset} label={resetLabel} />
    </>
  );
};

export default SliderComponent;
