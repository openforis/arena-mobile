import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';

import Icon from 'arena-mobile-ui/components/Icon';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import surveySelectors from 'state/survey/selectors';

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
        <TextTitle size="m">
          {job.type} - ({job?.progressPercent || uploadProgress}%)
        </TextTitle>
      </View>
    </TouchableOpacity>
  );
};

export default Header;
