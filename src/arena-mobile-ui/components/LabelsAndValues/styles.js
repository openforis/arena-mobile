import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    marginTop: baseStyles.bases.BASE,
    flexDirection: 'row',
    flex: 1,
  },
  labels: ({expanded}) => ({
    paddingRight: baseStyles.bases.BASE,
    ...(expanded ? {flex: 1} : {}),
  }),
  values: ({expanded}) => ({
    paddingRight: baseStyles.bases.BASE,

    ...(expanded
      ? {justifyContent: 'flex-end', alignItems: 'flex-end'}
      : {flex: 1}),
  }),

  color: {
    info: {
      color: colors.secondaryLighter,
    },
    alert: {
      color: colors.alert,
    },
  },
});

export default styles;
