import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const baseInputStyle = {
  fontSize: baseStyles.bases.BASE_4,
  paddingVertical: baseStyles.bases.BASE_2,
  paddingHorizontal: baseStyles.bases.BASE_3,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: baseStyles.bases.BASE,
  color: colors.black,
  paddingRight: baseStyles.bases.BASE_8,
  backgroundColor: colors.white,
};

const baseInputStyleNeutral = {
  fontSize: baseStyles.bases.BASE_4,
  paddingVertical: baseStyles.bases.BASE_2,
  paddingHorizontal: baseStyles.bases.BASE_3,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: baseStyles.bases.BASE,
  color: colors.black,
  paddingRight: baseStyles.bases.BASE_8,
  backgroundColor: colors.white,
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
    borderRadius: 180,
    padding: 0,
    margin: 0,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.neutralLight,
    minWidth: 80,
  },
  inputAndroid: {
    ...baseInputStyleNeutral,
    borderRadius: 180,

    margin: 0,
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  iconContainer: {
    top: baseStyles.bases.BASE_2,
    right: baseStyles.bases.BASE_2,
  },
});

export default styles;
