import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  base: {
    padding: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.background,
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
