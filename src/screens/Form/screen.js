import * as React from 'react';
import {View} from 'react-native';

import Layout from 'arena-mobile-ui/components/Layout';

import AttributeForm from './components/AttributeForm';
import BreadCrumbs from './components/BreadCrumbs';
import EntityPage from './components/EntityPage';
import EntitySelector from './components/EntitySelector';
import styles from './styles';

const Form = () => {
  return (
    <>
      <Layout bottomSafeArea={false}>
        <BreadCrumbs />

        <View style={[styles.container]}>
          <EntitySelector />
          <EntityPage />
        </View>
      </Layout>

      <AttributeForm />
    </>
  );
};

export default Form;
