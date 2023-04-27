import * as React from 'react';
import {ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';

import NavigateToSurveys from 'navigation/components/NavigateToSurveys';

import Actions from './components/Actions';
import SurveyDetail from './components/SurveyDetail';
import styles from './styles';

const Survey = () => {
  const {t} = useTranslation();
  return (
    <Layout>
      <>
        <Header hasBackComponent={true} RightComponent={<NavigateToSurveys />}>
          <TextTitle>{t('Common:survey')}</TextTitle>
        </Header>
      </>
      <ScrollView style={[styles.container]}>
        <SurveyDetail />
        <View style={styles.spacer} />
      </ScrollView>
      <Actions />
    </Layout>
  );
};

export default Survey;
