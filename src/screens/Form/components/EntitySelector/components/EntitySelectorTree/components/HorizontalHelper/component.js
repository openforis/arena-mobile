import React, {useMemo} from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const HorizonalHelper = ({level = 0}) => {
  const styles = useThemedStyles(_styles);
  const containerStyle = useMemo(
    () => styles.container(level),
    [styles, level],
  );

  return (
    <View style={containerStyle}>
      <View style={styles.helper} />
    </View>
  );
};

HorizonalHelper.defaultProps = {
  level: 0,
};

export default HorizonalHelper;
