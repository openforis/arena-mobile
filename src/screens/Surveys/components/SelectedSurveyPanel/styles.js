import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    backgroundColor: colors.primary,
    bottom: 0,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
});

export default styles;
