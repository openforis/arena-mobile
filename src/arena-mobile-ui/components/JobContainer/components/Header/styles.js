import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: baseStyles.bases.BASE_2,
      paddingTop: baseStyles.bases.BASE_4,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default styles;
