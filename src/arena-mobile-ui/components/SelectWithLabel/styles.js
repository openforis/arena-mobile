import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      marginTop: baseStyles.bases.BASE_2,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
  });

export default styles;
