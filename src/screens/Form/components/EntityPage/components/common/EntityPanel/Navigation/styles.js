import {StyleSheet, Dimensions} from 'react-native';

const {width: WIDTH} = Dimensions.get('screen');

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    header: {
      marginTop: baseStyles.bases.BASE_4,
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_4,
      paddingTop: 0,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flex: 1,
      textAlign: 'left',
    },

    optionsContainer: {
      padding: baseStyles.bases.BASE_4,

      flexDirection: 'row',
    },

    buttonsContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      flex: 1,
    },
    text: {
      width: WIDTH * 0.34,
      textAlign: 'right',
    },
    textTablet: {
      width: null,
    },
    textLeft: {
      textAlign: 'left',
    },
    button: {
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: colors.neutralLightest,
      padding: baseStyles.bases.BASE_2,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default styles;
