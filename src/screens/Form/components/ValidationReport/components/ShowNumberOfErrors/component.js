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
      <Icon
        name="alert-outline"
        color={numberOfErrors > 0 ? styles.colors.error : null}
      />
      <TextBase
        customStyle={
          numberOfErrors > 0 ? styles.validationReportHeaderTextError : null
        }>
        ({numberOfErrors})
      </TextBase>
    </View>
  );
};

export default ShowNumberOfErrors;
