import {StyleSheet} from 'react-native';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: baseStyles.bases.BASE_2,
    paddingHorizontal: baseStyles.bases.BASE_4,
    alignItems: 'center',
  },
});

export default styles;
