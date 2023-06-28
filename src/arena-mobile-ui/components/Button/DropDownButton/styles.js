import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    containerStyle: {
      justifyContent: 'space-around',
    },
    text: {
      textAlign: 'left',
      flex: 1,
      paddingLeft: baseStyles.bases.BASE_2,
      fontWeight: '100',
    },
    selected: {
      fontWeight: '400',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: colors.neutralLighter,
    },
  });
export default styles;
