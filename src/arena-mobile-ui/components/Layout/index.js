import React from 'react';

import {View, SafeAreaView, StatusBar} from 'react-native';

import styles from './styles';

const Layout = ({children}) => {
  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView />
      <SafeAreaView style={[styles.container, styles.bottom]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default Layout;
