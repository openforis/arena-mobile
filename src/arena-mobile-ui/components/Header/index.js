import React, {useMemo} from 'react';
import {View, StatusBar, StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import JobContainer from 'arena-mobile-ui/components/JobContainer';
import {Back} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Header = ({
  hasBackComponent,
  LeftComponent,
  children,
  RightComponent,
  withBorder,
}) => {
  const styles = useThemedStyles(_styles);
  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      withBorder ? styles.withBorder : {},
    );
  }, [withBorder, styles]);
  return (
    <>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        backgroundColor={colors.translucidLight}
        hidden={false}
      />
      <View style={containerStyle}>
        <View style={styles.left}>
          {!hasBackComponent && LeftComponent && LeftComponent()}
          {hasBackComponent && <Back />}
        </View>
        <View style={styles.main}>{children}</View>
        <View style={styles.right}>{RightComponent}</View>
      </View>
      <JobContainer />
    </>
  );
};

Header.defaultProps = {
  hasBackComponent: false,
  LeftComponent: null,
  RightComponent: null,
  withBorder: true,
};

export default Header;
