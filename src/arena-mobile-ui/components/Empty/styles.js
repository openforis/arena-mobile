import {Platform, StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignContent: 'center',
      padding: baseStyles.bases.BASE_4,
      paddingTop: baseStyles.bases.BASE_12,
      paddingBottom: Platform.OS === 'ios' ? baseStyles.bases.BASE_8 : 0,
    },
    info: {
      marginTop: baseStyles.bases.BASE_3,
    },
  });

export default styles;
