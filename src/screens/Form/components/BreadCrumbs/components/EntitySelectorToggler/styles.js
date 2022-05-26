import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  entitySelectorButton: {
    margin: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors.neutralLightest,
    transform: [{rotateZ: '180deg'}],
  },
});

export default styles;
