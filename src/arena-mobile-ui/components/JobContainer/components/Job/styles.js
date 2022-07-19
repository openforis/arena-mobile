import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');
import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

export const MAX_WIDTH = width * 0.4;
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
  },
  titleContainer: {
    flex: 1,
  },
  barContainer: {
    width: width * 0.4,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  errorContainer: {
    margin: baseStyles.bases.BASE,
    padding: baseStyles.bases.BASE,
    backgroundColor: colors.neutralLightest,
    borderRadius: baseStyles.bases.BASE,
    paddingLeft: baseStyles.bases.BASE_2,
    borderLeftWidth: baseStyles.bases.BASE,
    borderLeftColor: colors.error,
  },
});

export default styles;
