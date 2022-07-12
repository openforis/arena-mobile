import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    marginTop: baseStyles.bases.BASE,
  },
  input: {
    backgroundColor: colors.white,
    padding: baseStyles.bases.BASE_2,
    paddingVertical: baseStyles.bases.BASE_3,
    fontSize: baseStyles.fontSizes.m,
    borderWidth: 1,
    borderColor: colors.neutralLight,
    marginVertical: baseStyles.bases.BASE,
  },
});

export default styles;
