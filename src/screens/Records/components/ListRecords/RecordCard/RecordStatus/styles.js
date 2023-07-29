import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      paddingLeft: baseStyles.bases.BASE_2,
    },
    color: {
      success: {
        color: colors.success,
      },
      alert: {
        color: colors.alert,
      },
    },
  });

export default styles;
