import React from 'react';
import {View} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const Touchable = ({
  position = 'center',
  isSelected,
  icon = 'globe-outline',
  onPress,
}) => {
  return (
    <TouchableIcon
      onPress={onPress}
      iconName={icon}
      customStyle={[styles.touchable.base, styles.touchable[position]]}
      iconColor={isSelected ? colors.primaryDarkest : colors.secondaryLightest}
    />
  );
};

const SurveyOriginSelector = ({surveysOrigin, setSurveysOrigin}) => {
  return (
    <View style={[styles.container]}>
      <Touchable
        position="left"
        onPress={() => setSurveysOrigin('remote')}
        icon="globe-outline"
        isSelected={surveysOrigin === 'remote'}
      />
      <Touchable
        position="right"
        onPress={() => setSurveysOrigin('local')}
        icon="home-outline"
        isSelected={surveysOrigin === 'local'}
      />
    </View>
  );
};

export default SurveyOriginSelector;
