import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginBottom: baseStyles.bases.BASE_4,
    },
    disabled: {
      opacity: 0.5,
    },
    textsContainer: {
      flexDirection: 'column',
    },
    titleAndValidationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

export default styles;
