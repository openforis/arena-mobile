import {StyleSheet, Platform} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: baseStyles.bases.BASE_4,
    paddingBottom: baseStyles.bases.BASE_2,
    paddingTop: Platform.OS === 'android' ? baseStyles.bases.BASE_2 : 0,
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
