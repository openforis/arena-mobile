import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    button: {
      borderRadius: baseStyles.bases.BASE,
      marginLeft: 50,
      padding: 0,
    },
    colors,
  });

export default styles;
