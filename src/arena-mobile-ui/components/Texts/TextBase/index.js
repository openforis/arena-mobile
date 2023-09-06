import React, {useMemo} from 'react';
import {Text, StyleSheet} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles, {customStyles as CUSTOM_STYLES} from '../styles';

const TextBase = ({
  children,
  type,
  size,
  customStyle,
  isBackgroundSuccess,
  ...props
}) => {
  const styles = useThemedStyles(_styles);
  const textStyles = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles[type] || {}, styles.sizes[size] || {}),
      StyleSheet.compose(
        isBackgroundSuccess ? styles.success : {},
        customStyle,
      ),
    );
  }, [styles, type, size, customStyle, isBackgroundSuccess]);

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
  isBackgroundSuccess: false,
};

export default TextBase;
