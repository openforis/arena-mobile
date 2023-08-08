import {StyleSheet, Platform} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    modalContainer: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    safeContainer: {
      flexDirection: 'column',
      padding: baseStyles.bases.BASE_4,
    },
    container: {
      marginBottom: baseStyles.bases.BASE_8,
      backgroundColor: colors.backgroundLight,
      borderRadius: baseStyles.bases.BASE_4,
      padding: baseStyles.bases.BASE_2,
      marginHorizontal: Platform.OS === 'ios' ? baseStyles.bases.BASE_4 : 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  });

export default styles;
