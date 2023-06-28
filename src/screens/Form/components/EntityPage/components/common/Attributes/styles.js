import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      paddingVertical: baseStyles.bases.BASE_3,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    headerBlock: {
      minHeight: baseStyles.bases.BASE_8,
      backgroundColor: baseStyles.colors.backgroundLight,
    },
    block: {
      minHeight: 300,
      backgroundColor: baseStyles.colors.background,
      borderTopColor: baseStyles.colors.backgroundLight,
      borderTopWidth: baseStyles.bases.BASE_8,
    },
  });

export default styles;
