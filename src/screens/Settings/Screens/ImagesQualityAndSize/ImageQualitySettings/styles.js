import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundLighter,

      borderRadius: baseStyles.bases.BASE_16,
      padding: baseStyles.bases.BASE_16,
    },
    disabled: {
      opacity: 0.5,
    },
  });

export default styles;
