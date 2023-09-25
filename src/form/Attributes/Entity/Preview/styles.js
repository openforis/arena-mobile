import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    disabled: {
      opacity: 0.5,
      backgroundColor: colors.neutralLighter,
      borderColor: colors.borderColor,
    },
    container: {
      paddingHorizontal: baseStyles.bases.BASE_3,
    },
    colors,
  });

export default styles;
