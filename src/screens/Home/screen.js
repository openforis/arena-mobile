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
            <Text style={baseStyles.textStyle.title}>title</Text>
            <Text style={baseStyles.textStyle.header}>header</Text>
            <Text style={baseStyles.textStyle.text}>text</Text>
            <Text style={baseStyles.textStyle.bold}>bold</Text>
            <Button label="aa" />
            <Button type="secondary" label="secondary" />
            <Button type="ghost" label="ghost" />
            <Button type="ghostBlack" label="ghostBlack" />
            <Button type="delete" label="delete" />
          </View>
        </View>
      </>
    </Layout>
  );
};

export default Home;
