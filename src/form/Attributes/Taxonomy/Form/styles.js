import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {flex: 1},

  select: {
    marginBottom: baseStyles.bases.BASE,
  },

  text: {
    textAlign: 'left',
    flex: 1,
    paddingLeft: baseStyles.bases.BASE_2,
    fontWeight: '100',
  },
  selected: {
    fontWeight: '400',
  },
  card: {
    borderColor: colors.neutralLight,
    borderWidth: 1,
    padding: baseStyles.bases.BASE_4,
  },
  selectedItem: {
    backgroundColor: colors.secondary,
    color: colors.white,
  },
});
export default styles;
