import React from 'react';
import {View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const TopContent = ({handleClose}) => {
  return (
    <View style={[styles.topContainer]}>
      <TouchableIcon
        onPress={handleClose}
        customStyle={styles.buttonTouchableClose}
        iconName={'close'}
      />
    </View>
  );
};

export default TopContent;
