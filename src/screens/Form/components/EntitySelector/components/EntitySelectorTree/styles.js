import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderBottomColor: colors.neutralLightest,
      backgroundColor: colors.backgroundLight,
    },
    entityContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 0,
    },
    expandContainer: {
      borderRightColor: colors.neutralLightest,
      borderRightWidth: baseStyles.bases.BASE,
    },
    expandIcon: {
      margin: baseStyles.bases.BASE,
      padding: baseStyles.bases.BASE,
      borderRadius: baseStyles.bases.BASE_2,
      backgroundColor: colors.neutralLightest,
    },
    childrenContainer: {
      flexDirection: 'row',
      backgroundColor: colors.neutralLightest,
    },
    children: {
      flexDirection: 'column',
      width: '100%',
    },
  });

export default styles;
