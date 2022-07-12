import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const {width, height} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    backgroundColor: colors.white,
    bottom: 0,
    borderTopRightRadius: baseStyles.bases.BASE_4,
    borderTopLeftRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    paddingBottom: baseStyles.bases.BASE_16,
    borderColor: colors.neutralLighter,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  overlay: {
    position: 'absolute',
    height,
    width,
    backgroundColor: colors.translucidDark,
    bottom: 0,
    opacity: 0.4,
  },
});

export default styles;
