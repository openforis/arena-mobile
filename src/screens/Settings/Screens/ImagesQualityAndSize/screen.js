import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView} from 'react-native';
import {Switch} from 'react-native-elements';

import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import Slider from 'arena-mobile-ui/components/Slider';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const SettingsImagesQualityAndSize = () => {
  const styles = useThemedStyles(_styles);

  const navigation = useNavigation();

  const {t} = useTranslation();

  const handleSave = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'blue',
                padding: 10,
                borderRadius: 10,
              }}>
              <TextBase>Force max resolution</TextBase>
              <Switch
                value={true}
                onValueChange={() => {}}
                color="green"
                style={{marginBottom: 10}}
              />
            </View>
            <Slider
              title={t('Settings:images_quality_and_size.screen.slider.label')}
              info={t('Settings:images_quality_and_size.screen.slider.info')}
              value={1}
              onValueChange={() => {}}
              minimumValue={0}
              maximumValue={1}
              LeftComponent={
                <Icon name="format-font-size-decrease" size={40} />
              }
              RightComponent={
                <Icon name="format-font-size-increase" size={40} />
              }
            />

            <Slider
              title={t('Settings:images_quality_and_size.screen.slider.label')}
              info={t('Settings:images_quality_and_size.screen.slider.info')}
              value={1024}
              onValueChange={() => {}}
              minimumValue={480}
              maximumValue={4032}
              LeftComponent={
                <Icon name="format-font-size-decrease" size={40} />
              }
              RightComponent={
                <Icon name="format-font-size-increase" size={40} />
              }
            />

            <Slider
              title={t('Settings:images_quality_and_size.screen.slider.label')}
              info={t('Settings:images_quality_and_size.screen.slider.info')}
              value={1024}
              onValueChange={() => {}}
              minimumValue={480}
              maximumValue={4032}
              LeftComponent={
                <Icon name="format-font-size-decrease" size={40} />
              }
              RightComponent={
                <Icon name="format-font-size-increase" size={40} />
              }
            />
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              type="ghost"
              onPress={navigation.goBack}
              label={t('Common:cancel')}
            />
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
