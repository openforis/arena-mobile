import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const baseInputStyle = {
  fontSize: baseStyles.fontSizes.l,
  paddingVertical: baseStyles.bases.BASE_2,
  paddingHorizontal: baseStyles.bases.BASE_3,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: baseStyles.bases.BASE,
  color: colors.black,
  paddingRight: baseStyles.bases.BASE_8,
  backgroundColor: colors.backgroundLight,
};

const baseInputStyleNeutral = {
  fontSize: baseStyles.fontSizes.l,
  paddingVertical: baseStyles.bases.BASE_2,
  paddingHorizontal: baseStyles.bases.BASE_3,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: baseStyles.bases.BASE,
  color: colors.black,
  paddingRight: baseStyles.bases.BASE_8,
  backgroundColor: colors.backgroundLight,
  borderRadius: baseStyles.bases.BASE_2,
};

export const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    ...baseInputStyle,
  },
  inputAndroid: {
    ...baseInputStyle,
  },
  iconContainer: {
    top: baseStyles.bases.BASE_2,
    right: baseStyles.bases.BASE_2,
  },
});

export const pickerSelectStylesNeutral = StyleSheet.create({
  inputIOS: {
    ...baseInputStyleNeutral,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 0,
    borderColor: 'none',
    minWidth: 90,
    marginLeft: 8,
  },
  inputAndroid: {
    ...baseInputStyleNeutral,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 0,
    borderColor: 'none',
    minWidth: 90,
    marginLeft: 8,
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    paddingLeft: baseStyles.bases.BASE_2,
    top: baseStyles.bases.BASE_2,
    right: baseStyles.bases.BASE_2,
  },
});

export default styles;
