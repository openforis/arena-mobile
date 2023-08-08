import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      backgroundColor: colors.backgroundLighter,
      padding: baseStyles.bases.BASE_2,
      paddingHorizontal: baseStyles.bases.BASE_4,
      borderRadius: baseStyles.bases.BASE_2,
    },
  });

export default styles;
