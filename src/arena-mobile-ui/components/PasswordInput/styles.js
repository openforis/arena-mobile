import {StyleSheet} from 'react-native';

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
    padding: 4,
    paddingVertical: 2,
  },
  input: {
    flex: 1,
  },
});

export default styles;
