import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    ...baseStyles.card,
    container: {
      ...baseStyles.card.container,
      flexDirection: 'column',
    },
    infoContainer: {
      flexDirection: 'row',
    },
    labelCotainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    moreInfo: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignContent: 'flex-end',
    },
    payload: {
      flex: 1,
    },
  });

export default styles;
