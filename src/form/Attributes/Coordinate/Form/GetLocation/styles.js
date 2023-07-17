import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutralLightest,
      borderRadius: baseStyles.bases.BASE_2,
      paddingHorizontal: baseStyles.bases.BASE_2,
      paddingBottom: 0,
    },
    customTextStyle: {paddingLeft: baseStyles.bases.BASE_2},
    customContainerStyle: {justifyContent: 'flex-end'},
    accuracyBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: baseStyles.bases.BASE_2,
      height: baseStyles.bases.BASE_4,
      width: '100%',
    },
    accuracyBar: {
      backgroundColor: colors.backgroundLight,
      borderRadius: baseStyles.bases.BASE_2,
      height: baseStyles.bases.BASE_4,
      width: '100%',
    },
    accuracyBarFill: {
      backgroundColor: colors.primary,
      borderRadius: baseStyles.bases.BASE_2,
      height: baseStyles.bases.BASE_4,
    },
    accuracyBarTextContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    accuracyBarText: {
      color: colors.text,
      fontSize: baseStyles.fontSizes.FONT_SIZE_2,
    },
  });

export default styles;
