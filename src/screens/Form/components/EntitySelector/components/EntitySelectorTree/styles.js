import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLightest,
    backgroundColor: colors.white,
  },
  entityContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
  },
  expandContainer: {
    borderRightColor: colors.neutralLightest,
    borderRightWidth: baseStyles.bases.BASE,
  },
  expandIcon: {
    margin: baseStyles.bases.BASE,
    padding: baseStyles.bases.BASE,
    borderRadius: baseStyles.bases.BASE_2,
    backgroundColor: colors.neutralLightest,
  },
  childrenContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutralLightest,
  },
  children: {
    flexDirection: 'column',
    width: '100%',
  },
});

export default styles;
