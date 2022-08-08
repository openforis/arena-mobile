import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: baseStyles.bases.BASE_2,
  },
  formContainer: {
    flex: 1,
    padding: baseStyles.bases.BASE_4,
  },
  formItem: {
    paddingVertical: baseStyles.bases.BASE_4,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingTop: baseStyles.bases.BASE_8,
  },
  loggedInAs: {
    paddingVertical: baseStyles.bases.BASE_4,
  },
  serverUrlButton: {
    marginVertical: 0,
    justifyContent: 'flex-start',
  },
});

export default styles;
