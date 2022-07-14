import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    marginTop: baseStyles.bases.BASE,
    flexDirection: 'row',
  },
  labels: ({expanded}) => ({
    paddingRight: baseStyles.bases.BASE,
    ...(expanded ? {flex: 1} : {}),
  }),
  values: ({expanded}) => ({
    paddingRight: baseStyles.bases.BASE,
    ...(expanded ? {justifyContent: 'flex-end', alignItems: 'flex-end'} : {}),
  }),
});

export default styles;
