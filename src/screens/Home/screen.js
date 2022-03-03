import * as React from 'react';

import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import Layout from 'arena-mobile-ui/components/Layout';
import Header from 'arena-mobile-ui/components/Header';
import Button from 'arena-mobile-ui/components/Button';
import baseStyles from 'arena-mobile-ui/styles';

import {selectors as userSelectors} from 'state/user';

import NavigateToSettings from 'navigation/components/NavigateToSettings';

import LoggedInAs from './components/LoggedInAs';
import NotLoggedIn from './components/NotLoggedIn';
import styles from './styles';

const Home = () => {
  const {t} = useTranslation();
  const user = useSelector(userSelectors.getUser);

  return (
    <Layout>
      <>
        <Header LeftComponent={NavigateToSettings}>
          <Text style={[baseStyles.textStyle.title]}>Home</Text>
        </Header>
        <View style={[styles.container]}>
          <View>
            {user?.name ? <LoggedInAs /> : <NotLoggedIn />}

            <View style={[baseStyles.card.basicCard]}>
              <NavigateToSettings />
            </View>
          </View>
          <View style={{flex: 2, justifyContent: 'flex-end'}}>
            <Button />
            <Button />
            <Button />
            <Button />
          </View>
        </View>
      </>
    </Layout>
  );
};

export default Home;
