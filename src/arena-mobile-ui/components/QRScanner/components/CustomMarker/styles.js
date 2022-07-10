import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';
const {height, width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: height,
    width: width,
  },
  row: {
    flexDirection: 'row',
  },
  translucid: {
    flex: 1,
    backgroundColor: colors.translucidLight,
  },
  marker: {
    width: width * 0.67,
    height: width * 0.67,
    backgroundColor: colors.transparent,
    borderWidth: baseStyles.bases.BASE,
    borderColor: colors.alert,
    position: 'relative',
  },
  payload: {
    position: 'absolute',
    left: width * 0.05,
    top: width * 0.05,
    borderRadius: baseStyles.bases.BASE_4,
  },
});

export default styles;
