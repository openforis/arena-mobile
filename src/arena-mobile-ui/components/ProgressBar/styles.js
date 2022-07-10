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
    position: 'absolute',
    height: 30,
    backgroundColor: colors.neutralLighter,
    width,
    justifyContent: 'center',
    paddingRight: baseStyles.bases.BASE_3,
  },
  backgroundProgress: {
    position: 'absolute',
    height: 30,
    backgroundColor: colors.success,
  },
  progress: {
    marginRight: 8,
    textAlign: 'right',
  },
});

export default styles;
