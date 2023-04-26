import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: baseStyles.bases.BASE_2,
    },
    text: {
      textAlign: 'right',
      color: colors.secondary,
    },
  });

export default styles;
