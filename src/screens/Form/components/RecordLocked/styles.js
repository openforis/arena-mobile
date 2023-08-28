import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      flexDirection: 'row',
      backgroundColor: colors.alert,
      padding: baseStyles.bases.BASE_2,
    },
    lockedSwitch: {
      flex: 1,
    },
  });

export default styles;
