import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.neutralLightest,
  },
  helper: {
    flex: 1,

    borderColor: colors.neutralLight,
    borderBottomWidth: 1,
    width: 24,
  },
  divider: {
    height: 16,
  },
});

export default styles;
