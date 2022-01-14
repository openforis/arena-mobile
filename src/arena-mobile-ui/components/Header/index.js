import React from 'react';

import {View, StatusBar} from 'react-native';
import * as colors from 'arena-mobile-ui/colors';
import {Back} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const Header = ({
  hasBackComponent = false,
  LeftComponent = null,
  children,
  RightComponent = null,
  withBorder = true
}) => {
  console.log("hasBackComponent",hasBackComponent)
  return (
    <>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        backgroundColor={colors.green}
        hidden={false}
      />
      <View style={[styles.container, withBorder ? styles.withBorder : {}]}>
        <View style={[styles.left]}>
          {!hasBackComponent && LeftComponent && LeftComponent()}
          {hasBackComponent && <Back />}
        </View>
        <View style={[styles.main]}>{children}</View>
        <View style={[styles.right]}>{RightComponent}</View>
      </View>
    </>
  );
};

export default Header;
