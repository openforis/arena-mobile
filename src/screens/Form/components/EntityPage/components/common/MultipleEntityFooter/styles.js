import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  buttonContainer: {
    paddingVertical: 4,
    marginVertical: 0,
    borderColor: colors.neutral,
    borderWidth: 1,
  },
  addItem: {
    paddingHorizontal: 12,
  },
});

export default styles;
