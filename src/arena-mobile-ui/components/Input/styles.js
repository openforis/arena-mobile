import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      marginTop: baseStyles.bases.BASE,
      flex: 1,
    },
    stacked: {
      margin: 0,
    },
    horizontalContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    horizontalTitle: {
      paddingRight: baseStyles.bases.BASE_4,
    },
    input: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_2,
      paddingVertical: baseStyles.bases.BASE_3,
      fontSize: baseStyles.fontSizes.m,
      borderWidth: 1,
      borderColor: colors.borderColorSecondary,
      marginVertical: baseStyles.bases.BASE,
      color: colors.primaryText,
    },
    noEditable: {
      color: colors.neutralLight,
    },
  });

export default styles;
