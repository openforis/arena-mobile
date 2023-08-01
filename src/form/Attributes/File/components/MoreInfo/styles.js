import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      padding: baseStyles.bases.BASE_4,
      paddingVertical: baseStyles.bases.BASE_2,
      paddingBottom: baseStyles.bases.BASE_4,
      flexDirection: 'column',
      borderRadius: baseStyles.bases.BASE_4,
      backgroundColor: colors.neutralLightest,
    },
  });

export default styles;
