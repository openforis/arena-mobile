import {StyleSheet} from 'react-native';

import inputStyles from '../Input/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    ...inputStyles.input,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    paddingVertical: 2,
  },
  input: {
    width: '95%',
  },
});

export default styles;
