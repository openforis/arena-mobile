import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color: colors.neutralDarkest,

    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
  },
  activeContainer: {
    backgroundColor: colors.secondaryLighter,
  },
  text: {
    color: colors.neutralDarkest,
    flex: 1,
    padding: baseStyles.bases.BASE_2,
  },
  textDisabled: {
    color: colors.neutralLight,
  },
  active: {
    color: colors.neutralDarkest,
    fontWeight: 'bold',
  },
});

export default styles;
