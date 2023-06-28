import React, {useMemo} from 'react';
import {Text, StyleSheet} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles, {customStyles as CUSTOM_STYLES} from '../styles';

const TextBase = ({children, type, size, customStyle, ...props}) => {
  const styles = useThemedStyles(_styles);
  const textStyles = useMemo(() => {
    return StyleSheet.compose(
      styles[type] || {},
      styles.sizes[size] || {},
      customStyle,
    );
  }, [styles, type, size, customStyle]);

  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
};

TextBase.defaultProps = {
  type: 'text',
  size: null,
  customStyle: CUSTOM_STYLES,
};

export default TextBase;
