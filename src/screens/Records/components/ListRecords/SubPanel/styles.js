import {StyleSheet, Platform, Dimensions} from 'react-native';

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
    createNewRecordContainer: {
      top: -(baseStyles.bases.BASE_3 * 6 + baseStyles.FONT_BASE * 6),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',

      backgroundColor: 'transparent',
      width: Dimensions.get('window').width,
    },
  });

export default styles;
