import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const STORAGE_INFO_KEY = 'SHOULD_HIDE_STORAGE_INFO';

const AutomaticallyStoredInfo = () => {
  const [shouldShowInfo, setShouldShowInfo] = useState(false);
  const {t} = useTranslation();

  const checkIfShouldHide = useCallback(async () => {
    const isKeyStored = await AsyncStorage.getItem(STORAGE_INFO_KEY);

    if (isKeyStored !== 'true') {
      setShouldShowInfo(true);
    }
  }, []);

  const handleHide = useCallback(() => {
    setShouldShowInfo(false);
    AsyncStorage.setItem(STORAGE_INFO_KEY, 'true');
  }, []);

  useEffect(() => {
    checkIfShouldHide?.();
  }, [checkIfShouldHide]);

  if (!shouldShowInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TextBase type="secondaryText" size="s" customStyle={styles.text}>
        {t('Form:navigation_panel.automatically_stored_info')}
      </TextBase>
      <TouchableIcon iconName="close" onPress={handleHide} />
    </View>
  );
};

export default AutomaticallyStoredInfo;
