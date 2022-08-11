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
    flexDirection: 'column',
  },
  formContainer: {
    position: 'absolute',
    width: WIDTH,
    bottom: 0,
    zIndex: 99,
    flex: 1,
  },
  formContainerWithModal: {
    backgroundColor: 'white',
    borderRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  scroll: {
    borderRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
  },
});

export default styles;
