import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';
import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    color: colors.neutralDarkest,
    padding: baseStyles.bases.BASE_3,
    flex: 1,
  },
});

export default styles;
