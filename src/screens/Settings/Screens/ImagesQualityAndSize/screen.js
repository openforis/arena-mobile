import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView} from 'react-native';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as appActions} from 'state/app';

import ForceMaxResolution from './ForceMaxResolution';
import ImageQualitySettings from './ImageQualitySettings';
import _styles from './styles';

const SettingsImagesQualityAndSize = () => {
  const styles = useThemedStyles(_styles);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  const {t} = useTranslation();

  const handleSave = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReset = useCallback(() => {
    dispatch(appActions.resetImagesQualityAndSize());
  }, [dispatch]);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <TextBase type="title">
            {t('Settings:images_quality_and_size.title')}
          </TextBase>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            <TextBase type="header">
              {t('Settings:images_quality_and_size.screen.header')}
            </TextBase>

            <TextBase type="secondaryLight">
              {t('Settings:images_quality_and_size.screen.description')}
            </TextBase>

            <ForceMaxResolution />
            <ImageQualitySettings />
            <Button
              type="ghost"
              onPress={handleReset}
              label={t(
                'Settings:style.TextAndSpacingSize.screen.textSize.reset',
              )}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              type="primary"
              onPress={handleSave}
              label={t('Common:save')}
            />
          </View>
        </ScrollView>
      </>
    </Layout>
  );
};

export default SettingsImagesQualityAndSize;
