import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      paddingBottom: baseStyles.bases.BASE_4,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    divider: {
      marginVertical: baseStyles.bases.BASE_4,
    },
  });

export default styles;
