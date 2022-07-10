import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    borderRadius: baseStyles.bases.BASE,
    borderWidth: 1,
    padding: baseStyles.bases.BASE_2,
    marginBottom: baseStyles.bases.BASE_4,
  },
  primary: {
    backgroundColor: colors.white,
    borderColor: colors.neutralLight,
  },
  error: {
    backgroundColor: colors.errorLighter,
    borderColor: colors.errorDark,
  },
});

export default styles;
