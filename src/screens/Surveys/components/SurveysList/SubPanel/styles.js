import {StyleSheet, Platform} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    buttonsContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: baseStyles.bases.BASE_2,
      paddingHorizontal: baseStyles.bases.BASE_4,
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      paddingBottom:
        Platform.OS === 'ios' ? baseStyles.bases.BASE_8 : baseStyles.bases.BASE,
    },
  });

export default styles;
