import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    chipContainer: ({isActive}) => ({
      padding: baseStyles.bases.BASE_2,
      backgroundColor: isActive ? colors.secondary : colors.transparent,
      borderWidth: 1,
      borderColor: colors.neutralLighter,
      paddingHorizontal: baseStyles.bases.BASE,
      margin: baseStyles.bases.BASE / 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    label: ({isActive}) => ({
      textAlign: 'center',
      color: isActive ? colors.primaryContrastText : colors.primaryText,
    }),
    icon: ({isActive}) => ({
      textAlign: 'center',
      color: isActive ? colors.primaryContrastText : colors.primaryText,
      paddingLeft: baseStyles.bases.BASE_3,
    }),
  });
export default styles;
