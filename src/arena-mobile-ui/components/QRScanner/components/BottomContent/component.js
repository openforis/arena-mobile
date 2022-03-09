import React from 'react';
import {View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const QRScanner = ({visible = false, handleReactivate, handleClose}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.buttonsContainer]}>
      <TouchableIcon
        onPress={handleReactivate}
        customStyle={styles.buttonTouchable}
        iconName="refresh-outline"
      />

      <TouchableIcon
        onPress={handleClose}
        customStyle={styles.buttonTouchable}
        iconName="ios-checkmark"
      />
    </View>
  );
};

export default QRScanner;
