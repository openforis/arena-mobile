import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      justifyContent: 'space-between',
      alignItems: 'center',
      color: colors.neutralDarkest,
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_2,
    },
    activeContainer: {
      backgroundColor: colors.secondaryLighter,
    },
    text: {
      padding: baseStyles.bases.BASE_2,
    },
    textDisabled: {
      color: colors.neutralLight,
    },
    active: {
      color: colors.neutralDarkest,
      fontWeight: 'bold',
    },
  });

export default styles;
