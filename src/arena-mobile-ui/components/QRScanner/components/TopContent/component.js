import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const QRScanner = ({qrData, handleClose}) => {
  const {t} = useTranslation();

  return (
    <View style={[styles.topContainer]}>
      <TouchableIcon
        onPress={handleClose}
        customStyle={styles.buttonTouchableClose}
        iconName={'close'}
      />

      <View
        style={[qrData ? styles.dataContainer : styles.dataContainerNoData]}>
        <Text style={styles.data}>
          {qrData
            ? JSON.stringify(qrData, null, 2)
            : t('QRScanner:please_scan_the_code')}
        </Text>
      </View>
    </View>
  );
};

export default QRScanner;
