import {StyleSheet, Dimensions} from 'react-native';

const {width: WIDTH} = Dimensions.get('screen');

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      width: 0,
      backgroundColor: colors.neutralLight,
      borderRightColor: colors.neutralLight,
      borderRightWidth: 0,
      overflow: 'hidden',
    },
    scrollContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    buttonsContainer: {
      backgroundColor: colors.background,
      paddingBottom: 50,
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: baseStyles.bases.BASE_3,
      borderTopWidth: 1,
      borderTopColor: colors.neutralLighter,
    },
    closer: {
      width: WIDTH * 0.1,
      backgroundColor: colors.translucidDark,
    },
    pressableHeader: {
      backgroundColor: colors.background,
      width: '100%',
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: baseStyles.bases.BASE_3,
    },
  });

export default styles;
