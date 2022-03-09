import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    width,
    paddingHorizontal: 8,
  },
  buttonTouchableClose: {
    justifyContent: 'flex-end',
    allignItems: 'flex-end',
    flexDirection: 'row',
    padding: 8,
    marginBottom: 8,
  },
  data: {},
  dataContainer: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  dataContainerNoData: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
});

export default styles;
