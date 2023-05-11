import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';
const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    backgroundColor: colors.backgroundLight,
    bottom: 0,
    borderTopRightRadius: baseStyles.bases.BASE_4,
    borderTopLeftRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    paddingBottom: baseStyles.bases.BASE_24,
    borderColor: colors.neutralLighter,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default styles;
