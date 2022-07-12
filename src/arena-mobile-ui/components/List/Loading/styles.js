import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';
const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: baseStyles.bases.BASE_4,
  },
  item: {
    backgroundColor: colors.neutralLighter,
    height: baseStyles.bases.BASE_24,
    width: width - baseStyles.bases.BASE_8,
    marginTop: baseStyles.bases.BASE_2,
    borderRadius: baseStyles.bases.BASE_2,
  },
});

export default styles;
