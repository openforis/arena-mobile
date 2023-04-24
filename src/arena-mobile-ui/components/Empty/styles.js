import {StyleSheet} from 'react-native';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignContent: 'center',
    padding: baseStyles.bases.BASE_4,
    paddingTop: baseStyles.bases.BASE_12,
  },
  info: {
    marginTop: baseStyles.bases.BASE_3,
  },
});

export default styles;
