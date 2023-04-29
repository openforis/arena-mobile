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

    display: 'flex',
    flexDirection: 'column',
  },
  scroll: {
    borderRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: 100,
    margin: 0,
    minHeight: HEIGHT,
  },
  scrollContainer: {
    marginTop: baseStyles.bases.BASE_8,
    backgroundColor: colors.white,
  },

  viewcontainer: {
    borderRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
    flex: 1,
  },
  container: {
    flex: 1,

    flexDirection: 'column',
  },
  spacer: {
    height: 80,
  },
});

export default styles;
