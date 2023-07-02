import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Card = ({children, type, customStyles}) => {
  const styles = useThemedStyles(_styles);
  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.container, styles[type]),
      customStyles,
    );
  }, [type, styles, customStyles]);
  return <View style={containerStyle}>{children}</View>;
};

Card.defaultProps = {
  type: 'primary',
  customStyles: {},
};

export default Card;
