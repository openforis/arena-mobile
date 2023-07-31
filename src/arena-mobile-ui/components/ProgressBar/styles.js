import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    barContainer: {
      position: 'relative',
      zIndex: 1,
    },
    background: {
      borderRadius: baseStyles.bases.BASE_2,
      backgroundColor: colors.neutralLighter,
      width: width - baseStyles.bases.BASE_6,
      justifyContent: 'center',
      paddingRight: baseStyles.bases.BASE_3,
    },
    backgroundProgress: {
      position: 'absolute',
      borderRadius: baseStyles.bases.BASE_2,
      backgroundColor: colors.success,
    },
    colors,
  });

export default styles;
