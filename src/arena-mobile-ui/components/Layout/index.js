import React from 'react';
import {View, SafeAreaView} from 'react-native';

import styles from './styles';

const Layout = ({
  children,
  headerColor = null,
  bottomStyle = 'white',
  bottomSafeArea = true,
}) => {
  return (
    <View
      style={[
        styles.container,
        headerColor ? {backgroundColor: headerColor} : {},
      ]}>
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
