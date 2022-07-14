import {StyleSheet, Dimensions} from 'react-native';

const {height: HEIGHT, width: WIDTH} = Dimensions.get('screen');

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  shadowContainer: {
    height: HEIGHT,
    width: WIDTH,
    backgroundColor: colors.translucidDark,
    position: 'absolute',
    bottom: 0,
  },
  formContainer: {
    position: 'absolute',
    width: WIDTH,
    bottom: 0,
    zIndex: 99,
  },
  scroll: {
    borderRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
  },
});

export default styles;
