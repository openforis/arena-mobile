import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: colors.neutralLighter,
    height: 96,
    width: width - 32,
    marginTop: 8,
    borderRadius: 8,
  },
});

export default styles;
