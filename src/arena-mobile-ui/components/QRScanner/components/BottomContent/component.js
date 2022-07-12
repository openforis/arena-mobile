import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const BottomContent = ({
  qrData,
  visible = false,
  handleReactivate,
  handleClose,
}) => {
  const {t} = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container]}>
      <View
        style={[qrData ? styles.dataContainer : styles.dataContainerNoData]}>
        <Text
          style={[
            baseStyles.textStyle.bold,
            {paddingBottom: baseStyles.bases.BASE_2},
          ]}>
          {t('QRScanner:content')}:
        </Text>
        <Text style={styles.data} numberOfLines={3}>
          {qrData
            ? JSON.stringify(qrData, null, 2)
            : t('QRScanner:please_scan_the_code')}
        </Text>
      </View>

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
    </View>
  );
};

export default BottomContent;
