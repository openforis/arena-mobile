import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity, View, Text} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';

import styles from './styles';

const Touchable = ({
  position = 'center',
  isSelected,
  icon = 'globe-outline',
  onPress,
  label,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.touchable.base({isSelected}), styles.touchable[position]]}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
      <Icon
        name={icon}
        size={24}
        color={isSelected ? colors.secondary : colors.neutral}
      />
      <View style={[styles.labelContainer]}>
        <Text style={[styles.label({isSelected})]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SurveyOriginSelector = ({surveysOrigin, setSurveysOrigin}) => {
  const {t} = useTranslation();
  return (
    <View style={[styles.container]}>
      <Touchable
        position="left"
        onPress={() => setSurveysOrigin('local')}
        icon="bookmark-outline"
        isSelected={surveysOrigin === 'local'}
        label={t('Surveys:local.title')}
      />
      <Touchable
        position="right"
        onPress={() => setSurveysOrigin('remote')}
        icon="cloud-outline"
        isSelected={surveysOrigin === 'remote'}
        label={t('Surveys:remote.title')}
      />
    </View>
  );
};

export default SurveyOriginSelector;
