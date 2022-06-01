import * as React from 'react';
import {Text, Button, View} from 'react-native';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import NavigateToSettings from 'navigation/components/NavigateToSettings';
import {useNavigateTo} from 'navigation/hooks';

import BreadCrumbs from './components/BreadCrumbs';
import EntityPage from './components/EntityPage';
import EntitySelector from './components/EntitySelector';
import styles from './styles';

const Form = () => {
  const {navigateTo, routes} = useNavigateTo();
  return (
    <>
      <Layout bottomSafeArea={false}>
        <Header
          LeftComponent={NavigateToSettings}
          RightComponent={
            <Button title="home" onPress={navigateTo({route: routes.HOME})} />
          }>
          <Text style={[baseStyles.textStyle.title]}>Form</Text>
        </Header>

        <BreadCrumbs />

        <View style={[styles.container]}>
          <EntitySelector />
          <EntityPage />
        </View>
      </Layout>
    </>
  );
};

export default Form;
