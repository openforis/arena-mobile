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
      borderRadius: baseStyles.bases.BASE,
    },
    secondary: {
      backgroundColor: colors.backgroundLight,
      borderColor: colors.borderColorSecondary,
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

    bold: {
      ...baseStyles.textStyle.bold,
    },
    text: {
      primary: {
        color: colors.primaryContrastText,
      },
      secondary: {
        color: colors.secondaryTextButton,
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
        color: colors.secondaryText,
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
          color: colors.secondaryTextLight,
        },
      },
    },
  });

export default styles;
