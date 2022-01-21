import React from 'react';

import {Text} from 'react-native';

import Layout from 'arena-mobile-ui/components/Layout';
import Header from 'arena-mobile-ui/components/Header';
import styles from './styles';

const ConnectionSettings = () => {
  return (
    <Layout>
      <Header hasBackComponent>
        <Text>Connection settings</Text>
      </Header>

      <Text style={[styles.header]}>Server config</Text>
    </Layout>
  );
};

export default ConnectionSettings;
