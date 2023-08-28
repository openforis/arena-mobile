import React from 'react';
import {View} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import {useGetNumberOfErrors} from '../../hooks';

import _styles from './styles';

const ShowNumberOfErrors = () => {
  const styles = useThemedStyles(_styles);

  const numberOfErrors = useGetNumberOfErrors();

  return (
    <View style={styles.validationReportHeader}>
      <Icon name="alert-outline" />
      <TextBase>({numberOfErrors})</TextBase>
    </View>
  );
};

export default ShowNumberOfErrors;
