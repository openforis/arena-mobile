import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  ...baseStyles.card,
  container: {
    ...baseStyles.card.container,
    flexDirection: 'column',
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
