import * as React from 'react';
import {Text} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles, {customStyles as CUSTOM_STYLES} from '../styles';

const TextBase = ({
  children,
  type = 'text',
  size = null,
  customStyle = CUSTOM_STYLES,
  ...props
}) => {
  const styles = useThemedStyles(_styles);

  return (
    <Text
      style={[styles[type] || {}, styles.sizes[size] || {}, customStyle]}
      {...props}>
      {children}
    </Text>
  );
};

export default TextBase;
