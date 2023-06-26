import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, View} from 'react-native';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {actions as appActions} from 'state/app';

import {useDeviceUse} from '../hooks';

import styles from './styles';

const Version = () => {
  const dispatch = useDispatch();
  const [numTaps, setNumTaps] = useState(0);
  const {t} = useTranslation();

  const handleTap = useCallback(() => {
    if (numTaps === 4) {
      dispatch(appActions.setDevMode());
    }
    setNumTaps(numTaps + 1);
  }, [numTaps, dispatch]);

  const data = useDeviceUse();
  return (
    <View style={styles.container}>
      <Button
        type="ghostBlack"
        onPress={handleTap}
        label={`${t('Common:version')}: ${data.version} (${data.buildNumber})`}
      />
      {data.versionDate && Platform.OS !== 'ios' && (
        <TextBase size="s" type="secondaryText">{`${t('Common:date')}: ${
          data.versionDate
        }`}</TextBase>
      )}
    </View>
  );
};

export default Version;
