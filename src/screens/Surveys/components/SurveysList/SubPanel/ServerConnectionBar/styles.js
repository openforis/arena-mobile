import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: baseStyles.bases.BASE_2,
    paddingHorizontal: baseStyles.bases.BASE_6,
    alignItems: 'center',
    backgroundColor: colors.successLighter,
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
    paddingVertical: baseStyles.bases.BASE_2,
    margin: 0,
    maxWidth: 180,
  },
});

export default styles;
