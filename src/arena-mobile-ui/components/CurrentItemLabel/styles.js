import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: baseStyles.bases.BASE_2,
  },
  text: {
    ...baseStyles.textStyle.secondaryText,
    ...baseStyles.textSize.s,
    textAlign: 'right',
    color: colors.secondary,
  },
});

export default styles;
