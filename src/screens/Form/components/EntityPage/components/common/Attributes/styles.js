import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      paddingTop: baseStyles.bases.BASE_6,
      paddingVertical: baseStyles.bases.BASE_3,
      paddingHorizontal: baseStyles.bases.BASE_3,
    },
    block: {
      minHeight: 500,
    },
  });

export default styles;
