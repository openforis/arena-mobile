import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, Pressable} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';
import i18n from 'i18n';

const _LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
};

const LANGUAGES = ['en', 'es', 'fr', 'pt', 'de'];

const LanguageSelector = ({language, selectedLanguage, onPress}) => {
  const styles = useThemedStyles(_styles);

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.cardContent}>
          <Icon
            name={
              language == selectedLanguage
                ? 'radiobox-marked'
                : 'radiobox-blank'
            }
            size="m"
          />
          <TextBase type="header" customStyle={styles.cardTitle}>
            {' '}
            {_LANGUAGES[language]}
          </TextBase>
        </View>
      </Card>
    </Pressable>
  );
};

const SettingsApplicationLanguage = () => {
  const styles = useThemedStyles(_styles);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  const {t} = useTranslation();

  const handleSave = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectLanguage = useCallback(
    language => () => {
      i18n.changeLanguage(language);
      dispatch(
        appActions.setApplicationLanguage({
          applicationLanguage: language,
        }),
      );
    },
    [dispatch],
  );

  const applicationLanguage = useSelector(appSelectors.getApplicationLanguage);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <TextBase type="title">
            {t('Settings:application_language.title')}
          </TextBase>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            {LANGUAGES.map(language => (
              <LanguageSelector
                key={language}
                language={language}
                selectedLanguage={applicationLanguage}
                onPress={handleSelectLanguage(language)}
              />
            ))}
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

export default SettingsApplicationLanguage;
