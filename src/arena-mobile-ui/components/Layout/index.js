import React from 'react';
import {View, SafeAreaView} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Layout = ({
  children,
  bottomStyle = 'background',
  bottomSafeArea = true,
  topStyle = 'primary',
}) => {
  const styles = useThemedStyles({styles: _styles});
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
