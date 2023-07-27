import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    button: {
      flex: 1,
      borderRadius: baseStyles.bases.BASE,
    },
    buttonText: {
      marginRight: baseStyles.bases.BASE_2,
    },
  });

export default styles;
