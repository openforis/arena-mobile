import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    container: {flex: 1},
    buttonText: {
      color: colors.error,
    },
  });
export default styles;
