import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },

  touchable: {
    base: {
      backgroundColor: colors.background,
      padding: 8,
    },
    left: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    right: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
  },
});

export default styles;
