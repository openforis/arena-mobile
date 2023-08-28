import {StyleSheet, Dimensions, Platform} from 'react-native';

import {ENTITY_SELECTOR_TABLET_WIDTH} from 'screens/Form/components/EntitySelector/component';
const {width: WIDTH} = Dimensions.get('screen');

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      width: WIDTH,
      backgroundColor: colors.backgroundLight,
      bottom: 0,
      borderTopRightRadius: baseStyles.bases.BASE_4,
      borderTopLeftRadius: baseStyles.bases.BASE_4,
      paddingBottom:
        Platform.OS === 'ios'
          ? baseStyles.bases.BASE_6
          : baseStyles.bases.BASE_3,
      borderColor: colors.borderColorContrast,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderLeftWidth: 1,
      left: 0,
      minHeight: 120,
      flexDirection: 'column',
    },
    containerCollapsed: {
      width: baseStyles.bases.BASE_24,
      left: (WIDTH - baseStyles.bases.BASE_24) / 2,
      minHeight:
        baseStyles.bases.BASE_24 - Platform.OS === 'ios'
          ? baseStyles.bases.BASE_8
          : baseStyles.bases.BASE_12,
    },
    collapseButtonContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    collapseButton: {
      width: baseStyles.bases.BASE_24,
      height: baseStyles.bases.BASE_6,
      borderRadius: baseStyles.bases.BASE_6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      marginTop: baseStyles.bases.BASE_4,
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_4,
      paddingTop: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flex: 1,
      textAlign: 'left',
    },
    navigationBottom: {
      marginLeft: 0,
      marginBottom: 0,
      marginTop: baseStyles.bases.BASE,
    },
    textContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    containerTabletMenuOpen: {
      width: WIDTH - ENTITY_SELECTOR_TABLET_WIDTH,
    },
    button: {
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: colors.neutralLightest,
      padding: baseStyles.bases.BASE_2,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0,
    },
  });

export default styles;
