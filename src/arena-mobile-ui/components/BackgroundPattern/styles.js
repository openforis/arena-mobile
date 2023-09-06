import {StyleSheet, Dimensions} from 'react-native';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('screen');

const styles = () =>
  StyleSheet.create({
    imageContainer: {
      position: 'absolute',
      width: WIDTH,
      height: HEIGHT,
      top: 0,
      zIndex: -1,
      opacity: 0.5,
    },
  });

export default styles;
