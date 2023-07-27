import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      borderRadius: baseStyles.bases.BASE_8,
      paddingVertical: baseStyles.bases.BASE_3,
      paddingHorizontal: baseStyles.bases.BASE_4,
    },
  });

export default styles;
