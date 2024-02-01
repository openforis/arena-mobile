import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingBottom: 100,
    },
    tableContainer: {
      flex: 1,
      flexDirection: 'column',
    },
    header: {
      flexDirection: 'column',
      padding: baseStyles.bases.BASE_2,
    },
    newItemsButton: {
      width: '100%',
      padding: baseStyles.bases.BASE_4,
      borderWidth: 0,
    },
  });

export default styles;
