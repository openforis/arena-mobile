import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: baseStyles.bases.BASE_2,
      paddingHorizontal: baseStyles.bases.BASE_5,

      alignItems: 'center',
      backgroundColor: colors.successLighter,
    },
    containerWithError: {
      backgroundColor: colors.errorLighter,
      padding: 0,
    },
    containerWithInfo: {
      backgroundColor: colors.activeBackground,
    },

    text: {
      color: colors.neutral,
    },
    button: {
      paddingVertical: baseStyles.bases.BASE_2,
      margin: 0,
      maxWidth: 180,
    },
  });

export default styles;
