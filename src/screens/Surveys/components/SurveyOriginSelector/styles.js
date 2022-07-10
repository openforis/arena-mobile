import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },

  touchable: {
    base: ({isSelected}) => ({
      backgroundColor: colors.white,
      padding: baseStyles.bases.BASE_3 + baseStyles.bases.BASE_2,
      paddingVertical: baseStyles.bases.BASE_3,
      flex: 1,
      borderBottomWidth: isSelected ? baseStyles.bases.BASE_2 : 1,
      borderBottomColor: colors.secondary,
      flexDirection: 'row',
      justifyContent: 'center',
      aligngItems: 'center',
    }),
    left: {},
    right: {},
  },
  labelContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingLeft: baseStyles.bases.BASE,
  },
  label: ({isSelected}) => ({
    ...(isSelected ? baseStyles.textStyle.bold : {}),
    color: isSelected ? colors.secondary : colors.neutral,
  }),
});

export default styles;
