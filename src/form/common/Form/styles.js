import {StyleSheet, Dimensions} from 'react-native';

const {height: HEIGHT, width: WIDTH} = Dimensions.get('screen');

const styles = StyleSheet.create({
  shadowContainer: {
    height: HEIGHT,
    width: WIDTH,
    backgroundColor: '#00000070',
    position: 'absolute',
    bottom: 0,
  },
  formContainer: {
    position: 'absolute',
    width: WIDTH,
    bottom: 0,
    zIndex: 99,
  },
});

export default styles;
