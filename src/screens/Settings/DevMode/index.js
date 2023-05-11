import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';

import {alert} from 'arena-mobile-ui/utils';
import {selectors as appSelectors, actions as appActions} from 'state/app';
import globalActions from 'state/globalActions';

import styles from '../styles';
import Telemetry from '../Telemetry';

const Settings = () => {
  const dispatch = useDispatch();

  const {t} = useTranslation();

  const handleResetData = useCallback(() => {
    const requiredText = t('Settings:reset.required');

    alert({
      title: t('Settings:reset.title'),
      message: t('Settings:reset.message'),
      acceptText: t('Settings:reset.accept'),
      dismissText: t('Settings:reset.dismiss'),
      onAccept: () => {
        dispatch(globalActions.reset());
      },
      requiredText,
      requiredTextMessage: t('Common:required_text', {requiredText}),
    });
  }, [dispatch, t]);

  const handleDisableDevMode = useCallback(() => {
    dispatch(appActions.disableDevMode());
  }, [dispatch]);

  const isLoading = useSelector(appSelectors.getIsLoading);

  return (
    <>
      <Telemetry />
      <View style={styles.dividers} />
      <View>
        <Button
          type="ghost"
          onPress={handleResetData}
          label={t('Settings:reset.cta')}
          disabled={isLoading}
        />
      </View>
      <View style={styles.dividers} />
      <View>
        <Button
          type="ghost"
          onPress={handleDisableDevMode}
          label={t('Settings:devMode.disable')}
          disabled={isLoading}
        />
      </View>
    </>
  );
};

export default Settings;
