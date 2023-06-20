import React from 'react';
import {View, SafeAreaView} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const DEFAULT_BOTTOM_STYLE = 'background';
const DEFAULT_TOP_STYLE = 'primary';

const Layout = ({children, bottomStyle, bottomSafeArea, topStyle}) => {
  const styles = useThemedStyles(_styles);
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

Layout.defaultProps = {
  bottomStyle: DEFAULT_BOTTOM_STYLE,
  bottomSafeArea: true,
  topStyle: DEFAULT_TOP_STYLE,
};

export default Layout;
