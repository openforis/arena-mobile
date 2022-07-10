import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dotContainer: {
    width: baseStyles.bases.BASE_3,
    height: baseStyles.bases.BASE_3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: baseStyles.bases.BASE,
  },
  dot: {
    borderRadius: baseStyles.bases.BASE_2,
  },
});

export default styles;
