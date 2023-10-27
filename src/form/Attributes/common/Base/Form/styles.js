import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      paddingBottom: baseStyles.bases.BASE_24,
      flex: 1,
    },
    closeHeader: {
      justifyContent: 'flex-end',
      flexDirection: 'row',
    },
    closeIcon: {
      backgroundColor: colors.backgroundLight,
      borderRadius: baseStyles.bases.BASE,
      padding: baseStyles.bases.BASE,
    },
    divider: {
      height: baseStyles.bases.BASE_8,
    },
    buttonsContainer: {
      minHeight: baseStyles.bases.BASE_40,
    },
  });

export default styles;
