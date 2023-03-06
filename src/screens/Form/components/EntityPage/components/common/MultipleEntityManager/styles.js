import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  container: {
    color: colors.neutralDarkest,
    padding: 12,
    flex: 1,
  },
  option: {
    padding: 8,
  },
  buttonContainer: {
    paddingVertical: 6,
    marginVertical: 0,
    borderColor: colors.neutral,
    borderWidth: 1,
  },
  addItem: {
    width: 90,
    paddingHorizontal: 12,
  },
  button: {
    fontWeight: 'normal',
  },
  selectContainer: {
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

export default styles;
