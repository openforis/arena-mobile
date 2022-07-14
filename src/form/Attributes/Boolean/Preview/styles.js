import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  touchableContainer: ({active}) => ({
    padding: baseStyles.bases.BASE_2,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutralLighter,
    flexDirection: 'row',
    backgroundColor: active ? colors.secondary : colors.transparent,
  }),
  touchableLabel: ({active}) => ({
    paddingLeft: baseStyles.bases.BASE,
    color: active ? colors.primaryContrastText : colors.secondary,
  }),
});

export default styles;
