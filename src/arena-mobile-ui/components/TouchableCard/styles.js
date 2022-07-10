import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    borderRadius: baseStyles.bases.BASE,
    borderBottomWidth: 1,
    padding: baseStyles.bases.BASE_2,
    borderBottomColor: colors.neutralLighter,
    backgroundColor: colors.white,
    marginBottom: baseStyles.bases.BASE_4,
  },
});

export default styles;
