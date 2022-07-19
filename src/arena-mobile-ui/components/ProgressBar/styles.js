import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');
import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  barContainer: {
    position: 'relative',
    zIndex: 1,
  },
  background: {
    borderRadius: 8,

    backgroundColor: colors.neutralLighter,
    width: width - 24,
    justifyContent: 'center',
    paddingRight: baseStyles.bases.BASE_3,
  },
  backgroundProgress: {
    position: 'absolute',

    borderRadius: 8,

    backgroundColor: colors.success,
  },
});

export default styles;
