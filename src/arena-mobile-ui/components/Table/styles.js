import {StyleSheet} from 'react-native';

const MIN_WIDTH = 150;

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 0,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      backgroundColor: colors.neutralLighter,
    },
    headerRow: {
      flexDirection: 'row',
      flex: 1,
      minWidth: MIN_WIDTH,
      alignItems: 'center',
      backgroundColor: colors.neutralDarker,
      borderWidth: 1,
      borderColor: colors.borderColorSecondary,
    },
    headerCell: {
      justifyContent: 'center',
      padding: baseStyles.bases.BASE_2,
      alignItems: 'center',
      backgroundColor: colors.backgroundDarker,
      borderWidth: 1,
      borderColor: colors.borderColorSecondary,
    },
    cell: {
      justifyContent: 'center',
      padding: baseStyles.bases.BASE_2,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.neutralLighter,
    },
    body: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      flex: 1,
      minWidth: MIN_WIDTH,
      minHeight: baseStyles.bases.BASE_8,
      backgroundColor: colors.background,
    },
    oddRow: {
      backgroundColor: colors.backgroundLight,
    },
  });

export default styles;
