import React from 'react';
import {View, SafeAreaView} from 'react-native';

import styles from './styles';

const Layout = ({children, bottomStyle = 'white', bottomSafeArea = true}) => {
  return (
    <View style={[styles.container]}>
      <SafeAreaView />
      {bottomSafeArea ? (
        <SafeAreaView style={[styles.container, styles.bottom[bottomStyle]]}>
          {children}
        </SafeAreaView>
      ) : (
        children
      )}
    </View>
  );
};

export default Layout;
