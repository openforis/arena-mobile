import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color: colors.neutralDarkest,
    flexGrow: 1,
    padding: 4,
  },
  containerDisabled: {
    color: colors.neutralLighter,
  },
  text: {
    color: colors.neutralDarkest,
  },
  textDisabled: {
    color: colors.neutralLight,
  },
});

export default styles;
