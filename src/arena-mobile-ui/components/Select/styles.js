import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const baseInputStyle = ({pickerStyles = {}}) => ({
  fontSize: baseStyles.bases.BASE_4,
  paddingVertical: baseStyles.bases.BASE_2,
  paddingHorizontal: baseStyles.bases.BASE_3,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: baseStyles.bases.BASE,

  color: colors.black,
  paddingRight: baseStyles.bases.BASE_8,
  backgroundColor: colors.white,
  ...pickerStyles,
});

const styles = ({customStyles}) =>
  StyleSheet.create({
    inputIOS: {
      ...baseInputStyle({pickerStyles: customStyles}),
    },
    inputAndroid: {
      ...baseInputStyle({pickerStyles: customStyles}),
    },
    iconContainer: {
      top: baseStyles.bases.BASE_2,
      right: baseStyles.bases.BASE_2,
    },
  });

export default styles;
