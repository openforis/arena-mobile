import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  base: {
    padding: baseStyles.bases.BASE_2,
    paddingVertical: baseStyles.bases.BASE_3,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: baseStyles.bases.BASE_2,
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderColor: colors.neutralDarkest,
    borderWidth: 1,
  },
  delete: {
    backgroundColor: colors.error,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostBlack: {
    backgroundColor: colors.transparent,
  },
  text: {
    primary: {
      color: colors.white,
    },
    secondary: {
      color: colors.black,
    },
    delete: {
      color: colors.white,
    },
    ghost: {
      color: colors.secondary,
    },
    ghostBlack: {
      color: colors.black,
    },
  },
  disabled: {
    primary: {
      backgroundColor: colors.secondaryLightest,
    },
    text: {
      primary: {
        color: colors.neutralLight,
      },
    },
  },
});

export default styles;
