import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundLight,
      flexDirection: 'row',
      flex: 1,
    },
  });

export default styles;
