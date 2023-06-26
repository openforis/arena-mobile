import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    ...baseStyles.textStyle,
    sizes: {
      ...baseStyles.textSize,
    },
  });

export const customStyles = StyleSheet.create({});

export default styles;
