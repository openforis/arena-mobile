import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, Text, Pressable} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const SettingsStyleColorScheme = () => {
  const styles = useThemedStyles(_styles);
  const colorScheme = useSelector(appSelectors.getColorScheme);
  const [initialColorScheme, setInitialColorScheme] = useState(null);
  const [colorSchemeSelected, setColorSchemeSelected] = useState(colorScheme);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {t} = useTranslation();

  useEffect(() => {
    if (!initialColorScheme) {
      setInitialColorScheme(colorScheme);
    }
  }, [colorScheme, initialColorScheme]);

  useEffect(() => {
    if (colorSchemeSelected) {
      dispatch(
        appActions.setStyleColorScheme({
          colorScheme: colorSchemeSelected,
        }),
      );
    }
  }, [dispatch, colorSchemeSelected]);

  const handleSave = useCallback(() => {
    dispatch(
      appActions.setStyleColorScheme({
        colorScheme: colorSchemeSelected,
      }),
    );
    navigation.goBack();
  }, [dispatch, navigation, colorSchemeSelected]);

  const handleClose = useCallback(() => {
    // reset to initial values
    dispatch(
      appActions.setStyleColorScheme({
        colorScheme: initialColorScheme,
      }),
    );

    navigation.goBack();
  }, [dispatch, navigation, initialColorScheme]);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <Text type="title">
            {t('Settings:style.ColorScheme.title')} {colorSchemeSelected}
          </Text>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            <TextBase type="header" customStyle={styles.title}>
              {t('Settings:style.ColorScheme.screen.header')}{' '}
            </TextBase>

            <Text>{t('Settings:style.ColorScheme.screen.info')} </Text>

            <View style={{height: 100}} />
            {/* create two card touchables one with the light theme and the other with the dark theme */}
            <Pressable onPress={() => setColorSchemeSelected('light')}>
              <Card
                customStyle={[
                  styles.card,
                  colorSchemeSelected === 'light' && styles.cardSelected,
                ]}>
                <View style={styles.cardContent}>
                  <Icon
                    name={
                      colorSchemeSelected === 'light'
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                    size="m"
                  />
                  <TextBase type="header" customStyle={styles.cardTitle}>
                    {t('Settings:style.ColorScheme.screen.options.light')}
                  </TextBase>
                </View>
              </Card>
            </Pressable>

            <Pressable onPress={() => setColorSchemeSelected('dark')}>
              <Card
                customStyle={[
                  styles.card,
                  colorSchemeSelected === 'dark' && styles.cardSelected,
                ]}>
                <View style={styles.cardContent}>
                  <Icon
                    name={
                      colorSchemeSelected === 'dark'
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                    size="m"
                  />
                  <TextBase type="header" customStyle={styles.cardTitle}>
                    {t('Settings:style.ColorScheme.screen.options.dark')}
                  </TextBase>
                </View>
              </Card>
            </Pressable>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              type="ghost"
              onPress={handleClose}
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

export default SettingsStyleColorScheme;
