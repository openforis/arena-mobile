import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  card: {
    borderColor: colors.neutralLight,
    borderWidth: 1,
    padding: baseStyles.bases.BASE_4,
  },
  selectedItem: {
    backgroundColor: colors.secondary,
    color: 'white',
  },
});
export default styles;