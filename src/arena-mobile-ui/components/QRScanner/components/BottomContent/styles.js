import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  buttonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'space-between',
    width,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default styles;
