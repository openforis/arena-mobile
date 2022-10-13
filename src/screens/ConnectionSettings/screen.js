import {Objects} from '@openforis/arena-core';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import Header from 'arena-mobile-ui/components/Header';
import Input from 'arena-mobile-ui/components/Input';
import Layout from 'arena-mobile-ui/components/Layout';
import PasswordInput from 'arena-mobile-ui/components/PasswordInput';
import QRScanner, {
  useQRScanner,
  QRScannerButton,
} from 'arena-mobile-ui/components/QRScanner';
import baseStyles from 'arena-mobile-ui/styles';
import {alert} from 'arena-mobile-ui/utils';
import {selectors as appSelectors, actions as appActions} from 'state/app';
import globalActions from 'state/globalActions';
import {selectors as userSelectors} from 'state/user';

import styles from './styles';
import Telemetry from './Telemetry';
import Version from './Version';

const ConnectionSettings = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [formData, setFormData] = useState({});

  const onChangeText = useCallback(
    key =>
      (value = '') => {
        setFormData(prevValue => ({...prevValue, [key]: value}));
      },
    [],
  );

  const user = useSelector(userSelectors.getUser);
  const handleSubmitForm = useCallback(() => {
    dispatch(appActions.initConnection(formData));
  }, [dispatch, formData]);

  const handleResetData = useCallback(() => {
    alert({
      title: t('ConnectionSettings:reset.title'),
      message: t('ConnectionSettings:reset.message'),
      acceptText: t('ConnectionSettings:reset.accept'),
      dismissText: t('ConnectionSettings:reset.dismiss'),
      onAccept: () => {
        dispatch(globalActions.reset());
      },
    });
  }, [dispatch, t]);

  const {username, password} = useSelector(appSelectors.getAccessData);

  const serverUrl = useSelector(appSelectors.getServerUrl);
  const isLoading = useSelector(appSelectors.getIsLoading);
  const error = useSelector(appSelectors.getError);
  const isDevModeEnabled = useSelector(appSelectors.isDevModeEnabled);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      username: username || prevData.username,
      password: password || prevData.password,
      serverUrl: serverUrl || prevData.serverUrl,
    }));
  }, [username, password, serverUrl]);

  const handleSetServerUrl = useCallback(
    _serverUrl => () => {
      setFormData(prevData => ({
        ...prevData,
        serverUrl: _serverUrl || prevData.serverUrl,
      }));
    },
    [setFormData],
  );
  const {
    data: qrData,
    visible,
    readData: readQrData,
    cleanData,
    handleShow,
    handleClose,
  } = useQRScanner();

  useEffect(() => {
    if (qrData) {
      try {
        const qrDataParsed = JSON.parse(qrData);

        setFormData(prevData => ({
          ...prevData,
          username: qrDataParsed?.username || prevData.username,
          serverUrl: qrDataParsed?.serverUrl || prevData.serverUrl,
          password: qrDataParsed?.password || prevData.password,
        }));
      } catch (e) {
        console.log('qrData is not a valid json');
      }
    }
  }, [qrData]);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        {!visible && (
          <Header
            hasBackComponent
            RightComponent={<QRScannerButton handleShow={handleShow} />}>
            <Text style={[baseStyles.textStyle.title]}>
              {t('ConnectionSettings:title')}
            </Text>
          </Header>
        )}
        <QRScanner
          visible={visible}
          onRead={readQrData}
          qrData={qrData}
          cleanData={cleanData}
          handleClose={handleClose}
        />
        <KeyboardAvoidingView
          style={[styles.container, {zIndex: visible ? -1 : 2}]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView>
            <View style={[styles.formContainer]}>
              <View style={[styles.formItem]}>
                <Text style={[baseStyles.textStyle.header]}>
                  {t('ConnectionSettings:server_config_title')}
                </Text>

                <Input
                  title={t('ConnectionSettings:server_config_fields.address')}
                  onChangeText={onChangeText('serverUrl')}
                  value={formData?.serverUrl || serverUrl}
                  placeholder="https://test.openforis-arena.org"
                  autoCapitalize="none"
                />
                <Button
                  type="ghostBlack"
                  onPress={handleSetServerUrl(
                    'https://www.openforis-arena.org',
                  )}
                  label={t('ConnectionSettings:server_config_fields.prod', {
                    url: 'https://www.openforis-arena.org',
                  })}
                  customContainerStyle={[styles.serverUrlButton]}
                />
                {isDevModeEnabled && (
                  <Button
                    type="ghostBlack"
                    onPress={handleSetServerUrl(
                      'https://test.openforis-arena.org',
                    )}
                    label={t('ConnectionSettings:server_config_fields.prod', {
                      url: 'https://test.openforis-arena.org',
                    })}
                    customContainerStyle={[styles.serverUrlButton]}
                  />
                )}
              </View>

              <View style={[styles.formItem]}>
                <Text style={[baseStyles.textStyle.header]}>
                  {t('ConnectionSettings:access_info_title')}
                </Text>
                <Input
                  title={t('ConnectionSettings:access_info_fields.username')}
                  onChangeText={onChangeText('username')}
                  value={
                    Objects.isEmpty(formData?.username) &&
                    formData?.password !== ''
                      ? username
                      : formData?.username
                  }
                  autoCapitalize="none"
                />
                <PasswordInput
                  title={t('ConnectionSettings:access_info_fields.password')}
                  onChangeText={onChangeText('password')}
                  value={
                    Objects.isEmpty(formData?.password) &&
                    formData?.password !== ''
                      ? password
                      : formData?.password
                  }
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleSubmitForm}
                  label={t('ConnectionSettings:submit')}
                  disabled={isLoading}
                />
              </View>
              {error && (
                <Card type="error">
                  <Text style={[baseStyles.textStyle.bold]}>
                    {t('ConnectionSettings:error.title')}
                  </Text>
                  <Text style={[baseStyles.textStyle.text]}>
                    {t('ConnectionSettings:error.info')}
                  </Text>
                </Card>
              )}
              {user?.name && (
                <View style={styles.loggedInAs}>
                  <Text style={baseStyles.textStyle.secondaryText}>
                    {t('ConnectionSettings:connected_as')}
                  </Text>
                  <Text style={baseStyles.textStyle.text}>{user?.email}</Text>
                </View>
              )}
            </View>
            <Version />
            {isDevModeEnabled && <Telemetry />}
            <View style={{height: 100}} />
            <View>
              <Button
                type="ghost"
                onPress={handleResetData}
                label={t('ConnectionSettings:reset.cta')}
                disabled={isLoading}
              />
            </View>
            <View style={{height: 100}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    </Layout>
  );
};

export default ConnectionSettings;
