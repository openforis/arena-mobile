import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const {height, width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: colors.backgroundLight,
  },

  camera: {
    top: 0,
    height,
    width,
  },
});

export default styles;
