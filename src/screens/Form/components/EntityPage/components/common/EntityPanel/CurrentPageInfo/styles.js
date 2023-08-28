import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  headerTextInfo: {
    color: colors.neutralLight,
    paddingBottom: baseStyles.bases.BASE,
    textAlign: 'left',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 300,
  },
  label: {
    maxWidth: 150,
  },
  selectorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: baseStyles.bases.BASE,
    maxWidth: 120,
  },
});

export default styles;
