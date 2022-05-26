import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  breadCrumbsList: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    backgroundColor: colors.primaryLight,
  },
});

export default styles;
