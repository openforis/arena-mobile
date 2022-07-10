import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    width,
    paddingHorizontal: baseStyles.bases.BASE_2,
    backgroundColor: colors.primary,
  },
  buttonTouchableClose: {
    justifyContent: 'flex-start',
    allignItems: 'flex-start',
    flexDirection: 'row',
    padding: baseStyles.bases.BASE_2,
    marginBottom: baseStyles.bases.BASE_2,
  },
});

export default styles;
