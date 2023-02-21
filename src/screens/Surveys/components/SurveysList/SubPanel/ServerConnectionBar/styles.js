import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    paddingHorizontal: 23,
    alignItems: 'center',
  },
  containerWithError: {
    backgroundColor: colors.errorLighter,
    padding: 0,
  },
  text: {
    ...baseStyles.textSize.s,
    color: colors.neutral,
  },
  button: {
    paddingVertical: 8,
    margin: 0,
    maxWidth: 180,
  },
});

export default styles;
