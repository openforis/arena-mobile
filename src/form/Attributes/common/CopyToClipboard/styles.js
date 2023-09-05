import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    button: {
      margin: baseStyles.bases.BASE_2,
      padding: baseStyles.bases.BASE,
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: colors.neutralLightest,
      marginVertical: 0,
    },
  });

export default styles;
