import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');

import * as colors from 'arena-mobile-ui/colors';

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
    paddingRight: 12,
  },
  backgroundProgress: {
    position: 'absolute',
    height: 30,
    backgroundColor: colors.primary,
  },
  progress: {
    marginRight: 8,
    textAlign: 'right',
  },
});

export default styles;
