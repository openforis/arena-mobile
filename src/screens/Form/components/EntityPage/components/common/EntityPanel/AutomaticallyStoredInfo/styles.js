import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
    fontSize: baseStyles.fontSizes.s,
    color: colors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default styles;
