import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    button: {
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: colors.neutralLightest,
      padding: baseStyles.bases.BASE_2,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0,
    },
  });

export default styles;
