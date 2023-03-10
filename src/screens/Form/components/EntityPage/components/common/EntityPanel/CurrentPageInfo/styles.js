import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  headerTextInfo: {
    ...baseStyles.textSize.s,
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
    maxWidth: 160,
  },
  selectorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: baseStyles.bases.BASE,
  },
});

export default styles;
