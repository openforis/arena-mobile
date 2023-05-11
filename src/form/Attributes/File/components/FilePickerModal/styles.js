import {StyleSheet, Platform} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  safeContainer: {
    flexDirection: 'column',
    padding: baseStyles.bases.BASE_4,
  },
  container: {
    marginBottom: baseStyles.bases.BASE_8,
    backgroundColor: colors.backgroundLight,
    borderRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_2,
    marginHorizontal: Platform.OS === 'ios' ? baseStyles.bases.BASE_4 : 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default styles;
