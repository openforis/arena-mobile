import React, {useCallback} from 'react';
import {View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const Viewtoggler = ({entityAsTable, setEntityAsTable}) => {
  const handleToggle = useCallback(() => {
    setEntityAsTable(prevValue => !prevValue);
  }, [setEntityAsTable]);

  return (
    <View style={styles.container}>
      <View />
      <TouchableIcon
        iconName={entityAsTable ? 'format-list-checks' : 'table-large'}
        customStyle={styles.icon}
        hitSlop={baseStyles.bases.BASE_6}
        size={baseStyles.bases.BASE_8}
        onPress={handleToggle}
      />
    </View>
  );
};

export default Viewtoggler;
