import {StyleSheet, Platform, Dimensions} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    buttonsContainer: {
      display: 'flex',
      flexDirection: 'row',

      padding: baseStyles.bases.BASE,
      paddingHorizontal: baseStyles.bases.BASE_4,
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      paddingBottom:
        Platform.OS === 'ios' ? baseStyles.bases.BASE_8 : baseStyles.bases.BASE,
    },
    createNewRecordContainer: {
      top: -(baseStyles.bases.BASE_3 * 4 + baseStyles.FONT_BASE * 3),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',

      backgroundColor: 'transparent',
      width: Dimensions.get('window').width,
    },
    spinnerContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: baseStyles.bases.BASE_2,
      flex: 1,
    },
    bottomButtonsContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    colors,
  });

export default styles;
