import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.neutralLighter,
    padding: baseStyles.bases.BASE_2,
    paddingHorizontal: baseStyles.bases.BASE_4,
    borderRadius: baseStyles.bases.BASE_2,
  },
});

export default styles;
