import React from 'react';
import {View, SafeAreaView, StatusBar} from 'react-native';

import styles from './styles';

const Layout = ({children, bottomStyle = 'white'}) => {
  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView />
      <SafeAreaView style={[styles.container, styles.bottom[bottomStyle]]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default Layout;
