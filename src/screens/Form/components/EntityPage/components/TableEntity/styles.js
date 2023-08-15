import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    header: {
      textStyle: {
        color: colors.neutralLightest,
      },
    },
  });

export default styles;
