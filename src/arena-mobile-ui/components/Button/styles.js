import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
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
    neutral: {
      backgroundColor: colors.neutralLightest,
    },
    secondary: {
      backgroundColor: colors.white,
      borderColor: colors.neutralDarkest,
      borderWidth: 1,
    },
    delete: {
      backgroundColor: colors.error,
    },
    deleteGhost: {
      backgroundColor: colors.transparent,
    },
    ghost: {
      backgroundColor: colors.transparent,
    },
    ghostBlack: {
      backgroundColor: colors.transparent,
    },
    baseText: {
      fontSize: baseStyles.fontSizes.m,
    },
    text: {
      primary: {
        color: colors.primaryContrastText,
      },
      secondary: {
        color: colors.secondaryText,
      },
      neutral: {
        color: colors.secondaryText,
      },
      delete: {
        color: colors.primaryContrastText,
      },
      deleteGhost: {
        color: colors.error,
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
