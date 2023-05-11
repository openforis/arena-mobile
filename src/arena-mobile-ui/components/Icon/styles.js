import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    sizes: baseStyles.iconSizes,
    colors,
  });

export default styles;
