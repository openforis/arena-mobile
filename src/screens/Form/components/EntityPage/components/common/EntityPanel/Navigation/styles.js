import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const {width: WIDTH} = Dimensions.get('screen');

const styles = StyleSheet.create({
  header: {
    marginTop: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
    padding: baseStyles.bases.BASE_4,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
    textAlign: 'left',
  },

  optionsContainer: {
    padding: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
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
  text: {
    width: WIDTH * 0.34,
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  button: {
    borderRadius: baseStyles.bases.BASE,
    backgroundColor: colors.neutralLightest,
    padding: baseStyles.bases.BASE_2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;