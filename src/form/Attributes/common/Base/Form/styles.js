import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    color: colors.neutralDarkest,
    flex: 1,
    borderRadius: baseStyles.bases.BASE_4,
  },
  closeHeader: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  closeIcon: {
    backgroundColor: colors.neutralLighter,
    borderRadius: baseStyles.bases.BASE,
    padding: baseStyles.bases.BASE,
  },
  divider: {
    height: 100,
  },
});

export default styles;
