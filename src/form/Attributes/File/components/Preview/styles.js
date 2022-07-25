import {StyleSheet, Dimensions} from 'react-native';

const {width: WIDTH} = Dimensions.get('screen');
import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    marginVertical: baseStyles.bases.BASE_4,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  imgContainer: {
    height: Math.min(WIDTH * 0.5, 250),
    width: Math.min(WIDTH * 0.5, 250),
    marginHorizontal: 'auto',
  },
  image: {
    flex: 1,
    backgroundColor: colors.neutralLightest,
  },
});

export default styles;
