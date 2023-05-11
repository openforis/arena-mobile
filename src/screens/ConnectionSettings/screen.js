import {Objects} from '@openforis/arena-core';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Linking,
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
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TextHeader from 'arena-mobile-ui/components/Texts/TextHeader';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import {alert} from 'arena-mobile-ui/utils';
import {selectors as appSelectors, actions as appActions} from 'state/app';
import {selectors as userSelectors} from 'state/user';

import styles from './styles';

const SHOW_QR_HELPER = false;

const _valueOrDefault = (value, defaultValue) =>
  Objects.isEmpty(value) && value !== '' ? defaultValue : value;

const ConnectionSettings = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [formData, setFormData] = useState({});

  const onChangeText = useCallback(
    key =>
      (value = '') => {
        setFormData(prevValue => ({...prevValue, [key]: value.trim()}));
      },
    [],
  );

  const handleLogout = useCallback(() => {
    const requiredText = t('ConnectionSettings:logout.required');

    alert({
      title: t('ConnectionSettings:logout.title'),
      message: t('ConnectionSettings:logout.message'),
      acceptText: t('ConnectionSettings:logout.accept'),
      dismissText: t('ConnectionSettings:logout.dismiss'),
      onAccept: () => {
        dispatch(appActions.logout());
      },
      requiredText,
      requiredTextMessage: t('Common:required_text', {requiredText}),
    });
  }, [dispatch, t]);

  const user = useSelector(userSelectors.getUser);
  const handleSubmitForm = useCallback(() => {
    dispatch(appActions.initConnection(formData));
  }, [dispatch, formData]);

  const {username, password} = useSelector(appSelectors.getAccessData);

  const serverUrl = useSelector(appSelectors.getServerUrl);
  const isLoading = useSelector(appSelectors.getIsLoading);

  const credentialsError = useSelector(appSelectors.getCredentialsError);
  const serverError = useSelector(appSelectors.getServerError);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      username: username || prevData.username,
      password: password || prevData.password,
      serverUrl: serverUrl || prevData.serverUrl,
    }));
  }, [username, password, serverUrl]);

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

  const handleOpenForgotPassword = useCallback(() => {
    const url = `${serverUrl}/guest/forgotPassword/`;
    Linking.openURL(url);
  }, [serverUrl]);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        {!visible && (
          <Header
            hasBackComponent
            RightComponent={
              SHOW_QR_HELPER && <QRScannerButton handleShow={handleShow} />
            }>
            <TextTitle>{t('ConnectionSettings:title')}</TextTitle>
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
                <TextHeader>
                  {t('ConnectionSettings:server_config_title')}
                </TextHeader>

                <Input
                  title={t('ConnectionSettings:server_config_fields.address')}
                  onChangeText={onChangeText('serverUrl')}
                  value={_valueOrDefault(formData?.serverUrl, serverUrl)}
                  placeholder="https://test.openforis-arena.org"
                  autoCapitalize="none"
                />

                {serverError && (
                  <Card type="error">
                    <TextBase type="bold">
                      {t('ConnectionSettings:server_error.title')}
                    </TextBase>
                    <TextBase>
                      {t('ConnectionSettings:server_error.info')}
                    </TextBase>
                  </Card>
                )}
              </View>

              <View style={[styles.formItem]}>
                <TextHeader>
                  {t('ConnectionSettings:access_info_title')}
                </TextHeader>
                <Input
                  title={t('ConnectionSettings:access_info_fields.username')}
                  onChangeText={onChangeText('username')}
                  value={_valueOrDefault(formData?.username, username)}
                  autoCapitalize="none"
                />
                <PasswordInput
                  title={t('ConnectionSettings:access_info_fields.password')}
                  onChangeText={onChangeText('password')}
                  value={_valueOrDefault(formData?.password, password)}
                />
              </View>
              {credentialsError && (
                <Card type="error">
                  <TextBase type="bold">
                    {t('ConnectionSettings:credentials_error.title')}
                  </TextBase>
                  <TextBase>
                    {t('ConnectionSettings:credentials_error.info')}
                  </TextBase>
                </Card>
              )}

              {credentialsError && (
                <Button
                  type="ghostBlack"
                  onPress={handleOpenForgotPassword}
                  label={t(
                    'ConnectionSettings:credentials_error.forgot_password',
                  )}
                  customContainerStyle={[styles.serverUrlButton]}
                />
              )}

              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleSubmitForm}
                  label={t('ConnectionSettings:submit')}
                  disabled={isLoading}
                />
              </View>

              {user?.name && (
                <View style={styles.loggedInAs}>
                  <TextBase type="secondaryText">
                    {t('ConnectionSettings:connected_as')}
                  </TextBase>
                  <TextBase>({user?.email})</TextBase>
                  <Button
                    type="deleteGhost"
                    onPress={handleLogout}
                    label={t('ConnectionSettings:logout.cta')}
                  />
                </View>
              )}
            </View>

            <View style={styles.dividers} />
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    </Layout>
  );
};

export default ConnectionSettings;
