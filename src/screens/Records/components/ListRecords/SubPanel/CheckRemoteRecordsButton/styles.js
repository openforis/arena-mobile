import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    button: {
      flex: 1,
    },
    buttonText: {
      marginRight: baseStyles.bases.BASE_2,
    },
  });

export default styles;
