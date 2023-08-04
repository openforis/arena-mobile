import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.backgroundLighter,
      padding: baseStyles.bases.BASE_4,
      borderRadius: baseStyles.bases.BASE_3,
      marginVertical: baseStyles.bases.BASE_4,
    },
  });

export default styles;
