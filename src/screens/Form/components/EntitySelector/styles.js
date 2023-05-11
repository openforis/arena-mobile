import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';
const {width: WIDTH} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    width: 0,
    backgroundColor: colors.neutralLight,
    borderRightColor: colors.neutralLight,
    borderRightWidth: 0,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  buttonsContainer: {
    backgroundColor: colors.background,
    paddingBottom: 50,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: baseStyles.bases.BASE_3,
  },
  closer: {
    width: WIDTH * 0.1,
    backgroundColor: colors.translucidDark,
  },
});

export default styles;
