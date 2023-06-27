import React from 'react';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Icon = ({name, size, color}) => {
  const styles = useThemedStyles(_styles);
  return (
    <Icons
      name={name}
      size={styles.sizes[size]}
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
