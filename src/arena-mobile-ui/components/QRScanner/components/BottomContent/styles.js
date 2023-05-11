import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    padding: baseStyles.bases.BASE_2,
    width: width * 0.9,
    borderRadius: baseStyles.bases.BASE,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'space-between',

    paddingHorizontal: baseStyles.bases.BASE_4,

    paddingVertical: baseStyles.bases.BASE_2,
  },
  data: {
    maxHeight: 150,
    padding: baseStyles.bases.BASE_2,
    borderRadius: baseStyles.bases.BASE_4,
    backgroundColor: colors.neutralLightest,
  },
  button: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
