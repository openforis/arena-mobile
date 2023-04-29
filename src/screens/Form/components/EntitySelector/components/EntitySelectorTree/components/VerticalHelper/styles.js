import {StyleSheet} from 'react-native';
import baseStyles from 'arena-mobile-ui/styles';
import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.neutralLightest,
  },
  helper: {
    flex: 1,

    borderColor: colors.neutralLight,
    borderBottomWidth: 1,
    width: baseStyles.bases.BASE_6,
  },
  divider: {
    height: baseStyles.bases.BASE_4,
  },
});

export default styles;
