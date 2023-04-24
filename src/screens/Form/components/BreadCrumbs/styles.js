import {StyleSheet} from 'react-native';
import baseStyles from 'arena-mobile-ui/styles';
import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  breadCrumbsList: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: baseStyles.bases.BASE_2,
    backgroundColor: colors.primaryLight,
  },
});

export default styles;
