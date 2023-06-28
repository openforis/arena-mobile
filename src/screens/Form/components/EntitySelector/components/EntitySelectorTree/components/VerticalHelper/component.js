import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const VerticalHelper = () => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={styles.container}>
      <View style={styles.helper} />

      <View style={styles.divider} />
    </View>
  );
};

export default VerticalHelper;
