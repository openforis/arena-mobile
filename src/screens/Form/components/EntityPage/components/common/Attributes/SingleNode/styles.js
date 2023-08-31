import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      paddingVertical: baseStyles.bases.BASE_3,
      paddingHorizontal: 0,
      paddingTop: 0,
      flex: 1,
      justifyContent: 'flex-start',
      alignContent: 'flex-start',
    },
  });

export default styles;
