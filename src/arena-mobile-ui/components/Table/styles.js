import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const MIN_WIDTH = 150;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.neutralLighter,
  },
  headerRow: {
    flexDirection: 'row',
    flex: 1,
    minWidth: MIN_WIDTH,
    alignItems: 'center',
    backgroundColor: colors.neutralDarker,
    borderWidth: 1,
    borderColor: colors.neutralLightest,
  },
  headerCell: {
    justifyContent: 'center',
    padding: baseStyles.bases.BASE_2,
    alignItems: 'center',
    backgroundColor: colors.neutralDarker,
    borderWidth: 1,
    borderColor: colors.neutralLightest,
  },
  cell: {
    justifyContent: 'center',
    padding: baseStyles.bases.BASE_2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutralLighter,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    minWidth: MIN_WIDTH,
    minHeight: baseStyles.bases.BASE_8,
    backgroundColor: colors.neutralLightest,
  },
  oddRow: {
    backgroundColor: colors.white,
  },
});

export default styles;
