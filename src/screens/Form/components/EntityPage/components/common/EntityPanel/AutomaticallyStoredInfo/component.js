import React, {useEffect, useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './styles';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

const STORAGE_INFO_KEY = 'SHOULD_HIDE_STORAGE_INFO';

const AutomaticallyStoredInfo = () => {
  const [shouldShowInfo, setShouldShowInfo] = useState(false);
  const {t} = useTranslation();

  const checkIfShouldHide = useCallback(async () => {
    const isKeyStored = await AsyncStorage.getItem('SHOULD_HIDE_STORAGE_INFO');

    if (isKeyStored !== 'true') {
      setShouldShowInfo(true);
    }
  }, []);

  const handleHide = useCallback(() => {
    setShouldShowInfo(false);
    AsyncStorage.setItem(STORAGE_INFO_KEY, 'true');
  }, []);

  useEffect(() => {
    checkIfShouldHide();
  }, []);

  if (!shouldShowInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text>{t('Form:navigation_panel.automatically_stored_info')}</Text>
      <TouchableIcon iconName="close" onPress={handleHide} />
    </View>
  );
};

export default AutomaticallyStoredInfo;
