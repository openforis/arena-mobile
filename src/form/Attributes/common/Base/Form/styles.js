import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    color: colors.neutralDarkest,
    flex: 1,
    borderRadius: 16,
  },
  closeHeader: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  closeIcon: {
    backgroundColor: colors.neutralLighter,
    borderRadius: 4,
    padding: 4,
  },
  divider: {
    height: 100,
  },
});

export default styles;
