import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
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
      color: colors.neutralDarkest,
      flex: 1,
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
