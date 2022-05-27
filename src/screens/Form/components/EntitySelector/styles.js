import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    width: 0,
    backgroundColor: colors.neutralLighter,
    borderRightColor: colors.neutralLight,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  buttonsContainer: {
    backgroundColor: colors.neutralLight,
    paddingBottom: 50,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
});

export default styles;
