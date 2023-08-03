import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    jobContainer: {
      position: 'relative',
      backgroundColor: colors.translucidLight,
      zIndex: 1,
    },
    container: {
      position: 'absolute',
      zIndex: 1,
      backgroundColor: colors.backgroundLight,
      width: width - (baseStyles.bases.BASE_3 * 2 - 2),
      left: baseStyles.bases.BASE_3,
      top: baseStyles.bases.BASE_3,
      borderRadius: baseStyles.bases.BASE_2,
      borderWidth: 1,
      borderColor: colors.neutralLighter,
      padding: baseStyles.bases.BASE_3,
    },
    scrollContainer: {
      padding: baseStyles.bases.BASE_3,
      paddingTop: baseStyles.bases.BASE_3,
      paddingBottom: baseStyles.bases.BASE_8,
    },
    closeButton: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    barContainer: {
      paddingTop: baseStyles.bases.BASE_3,
      flexDirection: 'row',
    },
    baseStyles,
    colors,
  });

export default styles;
