import * as React from 'react';
import {Text, ScrollView} from 'react-native';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import NavigateToSettings from 'navigation/components/NavigateToSettings';

import Survey from './components/Survey';
import User from './components/User';
import styles from './styles';

const Home = () => {
  return (
    <Layout>
      <>
        <Header LeftComponent={NavigateToSettings}>
          <Text style={[baseStyles.textStyle.title]}>Home</Text>
        </Header>
        <ScrollView style={[styles.container]}>
          <User />
          <Survey />
        </ScrollView>
      </>
    </Layout>
  );
};

export default Home;
