import React from 'react';
import {useTranslation} from 'react-i18next';

import {ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';

import CheckAppUpdateBar from 'arena-mobile-ui/components/CheckAppUpdateBar';
import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import NavigateToSettings from 'navigation/components/NavigateToSettings';
import NavigateToSurveys from 'navigation/components/NavigateToSurveys';
import {selectors as surveySelectors} from 'state/survey';

import Actions from './components/Actions';
import Survey from './components/Survey';
import User from './components/User';
import _styles from './styles';
import {useVersionData} from 'screens/Settings/hooks';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

const Version = () => {
  const {t} = useTranslation();
  const styles = useThemedStyles(_styles);

  const versionData = useVersionData();

  return (
    <View style={styles.versionContainer}>
      <TextBase size={'xs'} type={'secondary'}>
        {`${t('Common:version')}: ${versionData.version} (${versionData.buildNumber})`}
      </TextBase>
    </View>
  );
};
const Home = () => {
  const {t} = useTranslation();
  const survey = useSelector(surveySelectors.getSurvey);
  const styles = useThemedStyles(_styles);

  return (
    <Layout bottomStyle="backgroundLight">
      <>
        <Header
          LeftComponent={NavigateToSettings}
          RightComponent={<NavigateToSurveys />}>
          <TextTitle>{t('Home:header_title')}</TextTitle>
        </Header>
        <CheckAppUpdateBar />

        <ScrollView style={styles.container}>
          <User />
          <Survey />
        </ScrollView>
        {survey && <Actions />}
        <Version></Version>
      </>
    </Layout>
  );
};

export default Home;
