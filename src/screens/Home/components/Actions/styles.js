import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      padding: baseStyles.bases.BASE_2,
      backgroundColor: baseStyles.colors.backgroundLight,
    },
    separator: {
      height: 60,
    },
  });

export default styles;
