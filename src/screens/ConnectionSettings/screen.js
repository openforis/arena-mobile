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
import {selectors as appSelectors, actions as appActions} from 'state/app';
import {selectors as userSelectors} from 'state/user';

import styles from './styles';

const ConnectionSettings = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [formData, setFormData] = useState({});

  const onChangeText = useCallback(
    key => value => {
      setFormData(prevValue => ({...prevValue, [key]: value}));
    },
    [],
  );

  const user = useSelector(userSelectors.getUser);
  const handleSubmitForm = useCallback(() => {
    dispatch(appActions.initConnection(formData));
  }, [dispatch, formData]);

  const {username, password} = useSelector(appSelectors.getAccessData);

  const serverUrl = useSelector(appSelectors.getServerUrl);
  const isLoading = useSelector(appSelectors.getIsLoading);
  const error = useSelector(appSelectors.getError);

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

  return (
    <Layout>
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
              <Text style={[baseStyles.textStyle.header]}>
                {t('ConnectionSettings:server_config_title')}
              </Text>

              <Input
                title={t('ConnectionSettings:server_config_fields.address')}
                onChangeText={onChangeText('serverUrl')}
                value={formData?.serverUrl || serverUrl}
              />

              <Text style={[baseStyles.textStyle.header]}>
                {t('ConnectionSettings:access_info_title')}
              </Text>

              <Input
                title={t('ConnectionSettings:access_info_fields.username')}
                onChangeText={onChangeText('username')}
                value={formData?.username || username}
              />
              <PasswordInput
                title={t('ConnectionSettings:access_info_fields.password')}
                onChangeText={onChangeText('password')}
                value={formData?.password || password}
              />

              <Button
                onPress={handleSubmitForm}
                label={t('ConnectionSettings:submit')}
                disabled={isLoading}
              />
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
                <Text style={baseStyles.textStyle.text}>
                  {t('ConnectionSettings:connected_as', {username: user?.name})}
                </Text>
              )}
            </View>
            <View style={{height: 100}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    </Layout>
  );
};

export default ConnectionSettings;
