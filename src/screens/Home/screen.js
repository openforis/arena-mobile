import * as React from 'react';

import {Text, View} from 'react-native';

import {useTranslation} from 'react-i18next';

import Layout from 'arena-mobile-ui/components/Layout';
import Header from 'arena-mobile-ui/components/Header';
import baseStyles from 'arena-mobile-ui/styles';

import NavigateToSettings from 'navigation/components/NavigateToSettings';

import styles from './styles';

const Home = () => {
  const {t} = useTranslation();
  return (
    <Layout>
      <>
        <Header LeftComponent={NavigateToSettings}>
          <Text style={[baseStyles.textStyle.title]}>Home</Text>
        </Header>
        <View style={[styles.container]}>
          <Text>Home</Text>
          <Text>{t('Common:common')}</Text>
          <Text>{t('Home:hello')}</Text>
        </View>
      </>
    </Layout>
  );
};

export default Home;
