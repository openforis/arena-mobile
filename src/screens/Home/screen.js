import * as React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import NavigateToSettings from 'navigation/components/NavigateToSettings';
import {selectors as userSelectors} from 'state/user';

import LoggedInAs from './components/LoggedInAs';
import NotLoggedIn from './components/NotLoggedIn';
import styles from './styles';

const Home = () => {
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
