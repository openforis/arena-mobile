import React from 'react';
import {ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';

import NavigateToSettings from 'navigation/components/NavigateToSettings';
import NavigateToSurveys from 'navigation/components/NavigateToSurveys';
import {selectors as surveySelectors} from 'state/survey';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import Actions from './components/Actions';
import Survey from './components/Survey';
import User from './components/User';
import _styles from './styles';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';

const Home = () => {
  const {t} = useTranslation();
  const survey = useSelector(surveySelectors.getSurvey);
  const styles = useThemedStyles({
    styles: _styles,
  });

  return (
    <Layout>
      <>
        <Header
          LeftComponent={NavigateToSettings}
          RightComponent={<NavigateToSurveys />}>
          <TextTitle>{t('Home:header_title')}</TextTitle>
        </Header>
        <ScrollView style={[styles.container]}>
          <User />
          <Survey />
        </ScrollView>
        {survey && <Actions />}
      </>
    </Layout>
  );
};

export default Home;
