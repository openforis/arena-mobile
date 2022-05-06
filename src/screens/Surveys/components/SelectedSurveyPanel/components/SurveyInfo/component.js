import React from 'react';
import {Text, View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const SurveyInfo = ({survey, unSelect}) => {
  return (
    <View style={[styles.container]}>
      <View>
        <Text style={[baseStyles.textStyle.bold]}>
          {survey.info.props.labels[survey?.info?.props?.languages?.[0]]}
        </Text>
        <Text style={[baseStyles.textStyle.text]}>
          {survey.info.id} · {survey.info.props.name} · {survey.info.status}
        </Text>
      </View>
      <TouchableIcon iconName="close" onPress={unSelect} />
    </View>
  );
};

export default SurveyInfo;
