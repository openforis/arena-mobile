import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: baseStyles.bases.BASE_4,
      paddingTop: 0,
      marginVertical: baseStyles.bases.BASE_4,
    },
    buttonsContainer: {
      padding: baseStyles.bases.BASE_4,
    },
    cardContent: {
      flexDirection: 'row',
    },
  });

export default styles;
