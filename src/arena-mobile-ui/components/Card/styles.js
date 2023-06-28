import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      borderRadius: baseStyles.bases.BASE,
      borderWidth: 1,
      padding: baseStyles.bases.BASE_2,
      marginBottom: baseStyles.bases.BASE_4,
    },
    primary: {
      backgroundColor: colors.backgroundLight,
      borderColor: colors.borderColor,
    },
    error: {
      backgroundColor: colors.errorLighter,
      borderColor: colors.errorDark,
    },
  });

export default styles;
