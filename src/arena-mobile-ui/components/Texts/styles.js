import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    ...baseStyles.textStyle,
    success: {
      color: colors.neutral,
    },
    sizes: {
      ...baseStyles.textSize,
    },
  });

export const customStyles = StyleSheet.create({});

export default styles;
