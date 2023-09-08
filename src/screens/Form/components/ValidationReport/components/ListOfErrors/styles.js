import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    validationItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_3,
    },
    validationItemContainerError: {
      borderLeftWidth: baseStyles.bases.BASE_2,
      borderLeftColor: colors.error,
    },
    validationItemContainerWarning: {
      borderLeftWidth: baseStyles.bases.BASE_2,
      borderLeftColor: colors.warning,
    },
    textContainer: {
      flex: 1,
    },
    validationText: {
      textAlign: 'left',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    pathContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
  });

export default styles;
