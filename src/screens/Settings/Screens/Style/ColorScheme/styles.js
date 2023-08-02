import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: baseStyles.bases.BASE_4,
      paddingTop: 0,
      marginVertical: baseStyles.bases.BASE_4,
    },
    cardTitle: {
      marginLeft: baseStyles.bases.BASE_2,
    },
    cardContent: {
      flexDirection: 'row',
    },
    buttonsContainer: {
      padding: baseStyles.bases.BASE_4,
    },
  });

export default styles;
