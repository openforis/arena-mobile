import * as React from 'react';
import {ScrollView, Text} from 'react-native';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import NavigateToSurveys from 'navigation/components/NavigateToSurveys';

import styles from './styles';

const Survey = () => {
  return (
    <Layout>
      <>
        <Header hasBackComponent={true} RightComponent={<NavigateToSurveys />}>
          <Text style={[baseStyles.textStyle.title]}>Survey</Text>
        </Header>
      </>
      <ScrollView style={[styles.container]}>
        <Text>sss</Text>
      </ScrollView>
    </Layout>
  );
};

export default Survey;