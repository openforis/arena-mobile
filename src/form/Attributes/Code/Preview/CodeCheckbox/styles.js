import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({});

export const chipStyles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipContainer: ({isActive}) => ({
    padding: 8,
    backgroundColor: isActive ? colors.secondary : colors.transparent,
    borderWidth: 1,
    borderColor: colors.neutralLighter,
    paddingHorizontal: 16,
    margin: 2,
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
