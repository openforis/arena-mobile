import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    button: {
      flex: 1,
      borderRadius: baseStyles.bases.BASE,
    },
    buttonText: {
      marginRight: baseStyles.bases.BASE_2,
    },
    colors,
  });

export default styles;
