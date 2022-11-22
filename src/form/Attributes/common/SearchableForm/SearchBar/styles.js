import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  selectBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectContainer: {
    flex: 1,
  },
  searchBox: {
    marginLeft: 0,
    marginBottom: baseStyles.bases.BASE,
    flex: 1,
  },
  close: {
    padding: baseStyles.bases.BASE_4,
  },
});
export default styles;
