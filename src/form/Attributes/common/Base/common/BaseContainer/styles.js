import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      paddingTop: baseStyles.bases.BASE,
      paddingBottom: baseStyles.bases.BASE_3,
      paddingHorizontal: baseStyles.bases.BASE_3,
      flex: 1,
    },
    disabled: {
      backgroundColor: colors.disabledBackground,
    },
    lastNodeDef: {
      backgroundColor: colors.activeBackground,
    },
  });

export default styles;
