import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    breadCrumbContainer: {
      height: '100%',
    },
    container: {
      flexDirection: 'column',
      backgroundColor: colors.primaryLighter,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: baseStyles.bases.BASE_2,

      borderRadius: baseStyles.bases.BASE_4,
      margin: baseStyles.bases.BASE_2,
      marginHorizontal: baseStyles.bases.BASE,
    },
  });

export default styles;
