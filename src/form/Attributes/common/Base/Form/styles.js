import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
    flex: 1,
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
    height: baseStyles.bases.BASE_8,
  },
});

export default styles;
