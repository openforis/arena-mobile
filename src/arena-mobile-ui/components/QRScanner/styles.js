import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const {height, width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: 3,
    width,
    backgroundColor: colors.primaryLight,
  },
  topView: {
    flex: 2,
    backgroundColor: colors.primary,
    zIndex: 2,
    padding: 8,
    paddingVertical: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomView: {
    backgroundColor: colors.primary,
    maxHeight: 80,
    zIndex: 2,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  camera: {
    position: 'absolute',
    height,
    zIndex: 1,
    width,
  },
  markers: {
    borderColor: colors.primaryLighter,
  },
});

export default styles;
