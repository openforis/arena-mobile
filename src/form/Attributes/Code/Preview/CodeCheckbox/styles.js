import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';
import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({});

export const chipStyles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipContainer: ({isActive}) => ({
    padding: baseStyles.bases.BASE_2,
    backgroundColor: isActive ? colors.secondary : colors.transparent,
    borderWidth: 1,
    borderColor: colors.neutralLighter,
    paddingHorizontal: baseStyles.bases.BASE_4,
    margin: baseStyles.bases.BASE / 2,
  }),
  label: ({isActive}) => ({
    textAlign: 'center',
    color: isActive ? colors.primaryContrastText : colors.black,
  }),
  icon: ({isActive}) => ({
    textAlign: 'center',
    color: isActive ? colors.primaryContrastText : colors.black,
  }),
});
export default styles;
