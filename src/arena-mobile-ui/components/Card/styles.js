import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
  },
  primary: {
    backgroundColor: colors.white,
    borderColor: colors.neutralLight,
  },
  error: {
    backgroundColor: colors.errorLighter,
    borderColor: colors.errorDark,
  },
});

export default styles;
