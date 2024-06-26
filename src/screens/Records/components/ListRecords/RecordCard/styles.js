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
    labelContainer: {
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
    activeItemContainer: {
      alignItems: 'flex-end',
    },
  });

export default styles;
