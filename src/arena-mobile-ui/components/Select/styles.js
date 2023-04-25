import {StyleSheet, Platform} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const baseInputStyle = {
  fontSize: baseStyles.fontSizes.l,
  paddingVertical: baseStyles.bases.BASE_2,
  paddingHorizontal: baseStyles.bases.BASE_3,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: baseStyles.bases.BASE,

  color: colors.black,
  paddingRight: baseStyles.bases.BASE_8,
  backgroundColor: colors.white,
};

const styles = StyleSheet.create({
  inputIOS: Object.assign({}, baseInputStyle),
  inputAndroid: Object.assign({}, baseInputStyle),
  iconContainer: {
    top:
      Platform.OS === 'android'
        ? baseStyles.bases.BASE_4
        : baseStyles.bases.BASE_2,
    right: baseStyles.bases.BASE_2,
  },
});

export default styles;
