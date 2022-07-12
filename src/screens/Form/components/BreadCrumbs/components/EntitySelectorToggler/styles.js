import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  entitySelectorButton: {
    margin: baseStyles.bases.BASE_2,
    padding: baseStyles.bases.BASE,
    borderRadius: baseStyles.bases.BASE,
    backgroundColor: colors.neutralLightest,
    transform: [{rotateZ: '180deg'}],
  },
});

export default styles;
