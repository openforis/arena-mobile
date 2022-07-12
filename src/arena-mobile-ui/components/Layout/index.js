import React from 'react';
import {View, SafeAreaView} from 'react-native';

import styles from './styles';

const Layout = ({
  children,
  bottomStyle = 'background',
  bottomSafeArea = true,
  topStyle = 'primary',
}) => {
  return (
    <View style={[styles.container, styles.top[topStyle]]}>
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
