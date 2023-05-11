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
    borderRadius: baseStyles.bases.BASE_2,

    backgroundColor: colors.neutralLighter,
    width: width - baseStyles.bases.BASE_6,
    justifyContent: 'center',
    paddingRight: baseStyles.bases.BASE_3,
  },
  backgroundProgress: {
    position: 'absolute',

    borderRadius: baseStyles.bases.BASE_2,

    backgroundColor: colors.success,
  },
});

export default styles;
