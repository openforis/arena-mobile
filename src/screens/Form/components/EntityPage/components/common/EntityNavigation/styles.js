import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';
const {width: WIDTH} = Dimensions.get('screen');
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: WIDTH,
    backgroundColor: colors.white,
    bottom: 0,
    borderTopRightRadius: baseStyles.bases.BASE_4,
    borderTopLeftRadius: baseStyles.bases.BASE_4,
    padding: baseStyles.bases.BASE_4,
    paddingBottom: baseStyles.bases.BASE_8,
    borderColor: colors.neutralLighter,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    left: 0,
    height: 70,
    flexDirection: 'row',
  },
  buttonsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 1,
  },
  buttonsContainerCenter: {
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
  },
});

export default styles;
