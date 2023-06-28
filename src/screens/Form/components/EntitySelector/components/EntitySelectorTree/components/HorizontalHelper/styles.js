import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    container: level => ({
      flexDirection: 'column',
      width: (28 + 16) / 2 + (level > 0 ? (28 + 16) / 2 : -2),
    }),
    helper: {
      flex: 1,
      borderRightColor: colors.neutralLight,
      borderRightWidth: 1,
      marginBottom: 18,
    },
  });

export default styles;
