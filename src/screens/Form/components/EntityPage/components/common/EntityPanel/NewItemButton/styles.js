import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    buttonContainer: {
      paddingVertical: baseStyles.bases.BASE,
      marginVertical: 0,
      borderColor: colors.neutral,
      borderWidth: 1,
    },
    addItem: {
      width: 90,
      paddingHorizontal: baseStyles.bases.BASE_3,
    },
    button: {
      fontWeight: 'normal',
    },
  });

export default styles;
