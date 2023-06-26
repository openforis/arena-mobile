import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Card = ({children, type = 'primary', customStyles = {}}) => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={[styles.container, styles[type], customStyles]}>
      {children}
    </View>
  );
};

export default Card;
