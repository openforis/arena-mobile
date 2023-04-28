import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, TouchableOpacity} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import Icon from 'arena-mobile-ui/components/Icon';
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
        <TextBase
          type="bold"
          customStyle={{paddingBottom: baseStyles.bases.BASE_2}}>
          {t('QRScanner:content')}:
        </TextBase>
        <TextBase customStyle={styles.data} numberOfLines={3}>
          {qrData
            ? JSON.stringify(qrData, null, 2)
            : t('QRScanner:please_scan_the_code')}
        </TextBase>
      </View>

      <View style={[styles.buttonsContainer]}>
        <TouchableOpacity style={[styles.button]} onPress={handleReactivate}>
          <Icon name="refresh" />
          <TextBase>{t('QRScanner:retry')}</TextBase>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button]} onPress={handleClose}>
          <Icon name="check" />
          <TextBase>{t('QRScanner:save')}</TextBase>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomContent;
