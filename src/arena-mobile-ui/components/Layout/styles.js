import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    top: {
      background: {
        backgroundColor: colors.background,
      },
      primary: {
        backgroundColor: colors.primary,
      },
    },
    bottom: {
      background: {
        backgroundColor: colors.background,
      },
      backgroundLight: {
        backgroundColor: colors.backgroundLight,
      },
      primary: {
        backgroundColor: colors.primary,
      },
    },
  });

export default styles;
