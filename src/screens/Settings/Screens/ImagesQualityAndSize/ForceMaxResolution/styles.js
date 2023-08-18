import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundLighter,
      borderRadius: baseStyles.bases.BASE_3,
      marginVertical: baseStyles.bases.BASE_4,
      padding: baseStyles.bases.BASE_4,
    },
  });

export default styles;
