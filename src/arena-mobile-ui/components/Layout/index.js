import React, {useMemo} from 'react';
import {View, SafeAreaView, StyleSheet} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const DEFAULT_BOTTOM_STYLE = 'background';
const DEFAULT_TOP_STYLE = 'primary';

const Layout = ({children, bottomStyle, bottomSafeArea, topStyle}) => {
  const styles = useThemedStyles(_styles);
  const containerStyle = useMemo(
    () => StyleSheet.compose(styles.container, styles.top[topStyle]),
    [styles, topStyle],
  );
  const bottomSafeAreaStyle = useMemo(
    () => StyleSheet.compose(styles.container, styles.bottom[bottomStyle]),
    [styles, bottomStyle],
  );

  return (
    <View style={containerStyle}>
      <SafeAreaView />
      {bottomSafeArea ? (
        <SafeAreaView style={bottomSafeAreaStyle}>{children}</SafeAreaView>
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
