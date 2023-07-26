import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    ...baseStyles.card,
    payload: {
      flex: 1,
    },
  });

export default styles;
