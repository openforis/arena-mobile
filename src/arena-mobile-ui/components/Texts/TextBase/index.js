import * as React from 'react';
import {Text} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import _styles from '../styles';

const TextBase = ({
  children,
  type = 'text',
  size = null,
  customStyle = {},
  ...props
}) => {
  const styles = useThemedStyles({styles: _styles});
  return (
    <Text
      style={[styles[type] || {}, styles.sizes[size] || {}, customStyle]}
      {...props}>
      {children}
    </Text>
  );
};

export default TextBase;
