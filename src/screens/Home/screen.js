import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Text, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import NavigateToSettings from 'navigation/components/NavigateToSettings';
import NavigateToSurveys from 'navigation/components/NavigateToSurveys';
import {ROUTES} from 'navigation/constants';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as userSelectors} from 'state/user';

import Actions from './components/Actions';
import Survey from './components/Survey';
import User from './components/User';
import styles from './styles';

const Home = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const user = useSelector(userSelectors.getUser);
  const navigation = useNavigation();

  useEffect(() => {
    if (!user.uuid) {
      navigation.navigate(ROUTES.CONNECTION_SETTINGS);
    } else {
      if (!survey.id) {
        navigation.navigate(ROUTES.SURVEYS);
      }
    }
  }, [navigation, survey, user]);
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
