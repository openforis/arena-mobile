import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 0,
    margin: 0,
    marginBottom: 0,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  selected: {
    backgroundColor: colors.primaryLight,
  },
});

export default styles;
