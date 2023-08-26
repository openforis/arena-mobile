import React from 'react';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Icon = ({name, size, color}) => {
  const styles = useThemedStyles(_styles);
  if (!name) {
    return null;
  }
  return (
    <Icons
      name={name}
      size={isNaN(size) ? styles.sizes[size] : size}
      color={color || styles.colors.primaryText}
    />
  );
};

Icon.defaultProps = {
  name: '',
  size: 'm',
  color: null,
};

export default React.memo(Icon);
