import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'center',
  },
  container: {
    backgroundColor: 'white',
    color: colors.neutralDarkest,
    padding: 12,
    flex: 1,
  },
  option: {
    padding: 8,
  },
});

export default styles;
