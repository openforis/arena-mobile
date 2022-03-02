import * as React from 'react';
import {StyleSheet} from 'react-native';
import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.primary,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  left: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 50,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 50,
  },
});

export default styles;
