import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';
import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  buttonContainer: {
    paddingVertical: baseStyles.bases.BASE,
    marginVertical: 0,
    borderColor: colors.neutral,
    borderWidth: 1,
  },
  addItem: {
    width: 90,
    paddingHorizontal: baseStyles.bases.BASE_3,
  },
  button: {
    fontWeight: 'normal',
  },
});

export default styles;
