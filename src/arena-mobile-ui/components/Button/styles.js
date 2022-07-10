import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = ({colors}) =>
  StyleSheet.create({
    base: {
      padding: baseStyles.bases.BASE_2,
      paddingVertical: baseStyles.bases.BASE_3,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: baseStyles.bases.BASE_2,
      flexDirection: 'row',
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
        color: colors.primaryContrastText,
      },
      secondary: {
        color: colors.secondaryText,
      },
      delete: {
        color: colors.primaryContrastText,
      },
      ghost: {
        color: colors.secondary,
      },
      ghostBlack: {
        color: colors.primaryText,
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
