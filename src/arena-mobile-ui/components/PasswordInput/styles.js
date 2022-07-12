import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

import inputStyles from '../Input/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    ...inputStyles.input,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: baseStyles.bases.BASE,
    paddingVertical: baseStyles.bases.BASE_2,
  },
  input: {
    flex: 1,
  },
});

export default styles;
