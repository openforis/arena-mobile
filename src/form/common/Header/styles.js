import {StyleSheet} from 'react-native';

const styles = () =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    disabled: {
      opacity: 0.3,
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
