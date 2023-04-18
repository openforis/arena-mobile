import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: baseStyles.bases.BASE_4,
    paddingTop: 0,
    marginVertical: baseStyles.bases.BASE_4,
  },
  dividers: {
    height: 100,
  },

  buttonsContainer: {
    padding: baseStyles.bases.BASE_4,
  },
  exampleContainer: {
    marginVertical: baseStyles.bases.BASE_6,
  },
  example: {
    ...baseStyles.textStyle.header,
    textAlign: 'center',
  },
});

export default styles;
