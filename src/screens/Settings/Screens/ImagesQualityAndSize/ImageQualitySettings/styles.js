import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundLighter,

      borderRadius: baseStyles.bases.BASE_4,
      padding: baseStyles.bases.BASE_4,
    },
    disabled: {
      opacity: 0.5,
    },
    sliderContainer: {
      marginBottom: baseStyles.bases.BASE_6,
    },
  });

export default styles;
