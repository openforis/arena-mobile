import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 0,
    margin: 0,
    marginBottom: 0,
    paddingLeft: baseStyles.bases.BASE_2 + baseStyles.bases.BASE_3,
    paddingRight: baseStyles.bases.BASE_3,
    backgroundColor: colors.white,
    borderLeftColor: colors.transparent,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selected: {
    borderLeftWidth: baseStyles.bases.BASE_2,
    paddingLeft: baseStyles.bases.BASE_3,
    borderLeftColor: colors.secondary,
  },
});

export default styles;
