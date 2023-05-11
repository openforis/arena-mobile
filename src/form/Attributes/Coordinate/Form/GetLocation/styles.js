import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutralLightest,
    borderRadius: baseStyles.bases.BASE_2,
    paddingHorizontal: baseStyles.bases.BASE_2,
    paddingBottom: 0,
  },
  customTextStyle: {paddingLeft: baseStyles.bases.BASE_2},
  customContainerStyle: {justifyContent: 'flex-end'},
});

export default styles;
