import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    disabledText: {
      color: colors.neutralLighter,
    },
    textStyle: {
      maxWidth: 160,
    },
  });

export default styles;
