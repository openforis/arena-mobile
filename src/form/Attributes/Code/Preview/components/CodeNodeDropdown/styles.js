import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  containerStyle: {justifyContent: 'space-around'},
  text: {
    textAlign: 'left',
    flex: 1,
    paddingLeft: baseStyles.bases.BASE_2,
    fontWeight: '100',
  },
  selected: {
    fontWeight: '400',
  },
});
export default styles;