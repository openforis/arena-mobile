import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const baseInputStyle = {
  fontSize: 15,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: 4,
  color: colors.black,
  paddingRight: 30,
  backgroundColor: colors.white,
};

const baseInputStyleNeutral = {
  fontSize: 15,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: colors.neutral,
  margin: 4,
  color: colors.black,
  paddingRight: 30,
  backgroundColor: colors.white,
  borderRadius: 8,
};

export const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    ...baseInputStyle,
  },
  inputAndroid: {
    ...baseInputStyle,
  },
  iconContainer: {
    top: 8,
    right: 8,
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
    top: 8,
    right: 8,
  },
});

export default styles;
