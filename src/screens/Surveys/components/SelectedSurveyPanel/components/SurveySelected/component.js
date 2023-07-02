import React from 'react';
import {View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import SurveyInfo from './../../../common/SurveyInfo';
import styles from './styles';

const SurveySelected = ({survey, unSelect}) => {
  return (
    <View style={styles.container}>
      <SurveyInfo survey={survey} />
      <TouchableIcon iconName="close" onPress={unSelect} />
    </View>
  );
};

export default SurveySelected;
