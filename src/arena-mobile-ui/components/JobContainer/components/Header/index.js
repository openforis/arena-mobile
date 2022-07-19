import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';

import baseStyles from 'arena-mobile-ui/styles';
import surveySelectors from 'state/survey/selectors';

import Icon from '../../../Icon';

import styles from './styles';

const Header = ({collapsed, setCollapsed}) => {
  const job = useSelector(surveySelectors.getJob);
  const uploadProgress = useSelector(surveySelectors.getUploadProgress);

  return (
    <TouchableOpacity
      onPress={() => setCollapsed(prevState => !prevState)}
      style={styles.container}>
      <Icon name={collapsed ? 'chevron-right' : 'chevron-down'} />
      <View style={{flex: 1}}>
        <Text style={[baseStyles.textStyle.title, baseStyles.textSize.m]}>
          {job.type} - ({job?.progressPercent || uploadProgress}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Header;
