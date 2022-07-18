import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  separator: {
    width: baseStyles.bases.BASE,
  },
  textStyle: {
    paddingVertical: baseStyles.bases.BASE,
  },
});

export default styles;
