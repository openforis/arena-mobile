import React from 'react';
import {Text, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import NavigateToSettings from 'navigation/components/NavigateToSettings';
import NavigateToSurveys from 'navigation/components/NavigateToSurveys';
import {selectors as surveySelectors} from 'state/survey';

import Actions from './components/Actions';
import Survey from './components/Survey';
import User from './components/User';
import styles from './styles';

const Home = () => {
  const survey = useSelector(surveySelectors.getSurvey);

  return (
    <Layout>
      <>
        <Header
          LeftComponent={NavigateToSettings}
          RightComponent={<NavigateToSurveys />}>
          <Text style={[baseStyles.textStyle.title]}>Arena</Text>
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
