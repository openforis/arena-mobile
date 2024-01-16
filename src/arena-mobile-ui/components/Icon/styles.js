import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    sizes: baseStyles.iconSizes,
    colors,
    icon: {
      paddingHorizontal: baseStyles.bases.BASE_2,
    },
  });

export default styles;
