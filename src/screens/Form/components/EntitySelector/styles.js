import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    width: 0,
    backgroundColor: colors.neutralLight,
    borderRightColor: colors.neutralLight,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  buttonsContainer: {
    backgroundColor: colors.neutralLight,
    paddingBottom: 50,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: baseStyles.bases.BASE_3,
  },
});

export default styles;
