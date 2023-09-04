import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutralLightest,
      borderRadius: baseStyles.bases.BASE_2,

      paddingBottom: 0,
    },
    customTextStyle: {paddingLeft: baseStyles.bases.BASE_2},

    accuracyBarContainer: {
      flexDirection: 'row',

      padding: baseStyles.bases.BASE_2,
      backgroundColor: colors.backgroundLighter,
      borderRadius: baseStyles.bases.BASE_2,
    },
    accuracyIconContainer: {
      backgroundColor: colors.white,
      borderRadius: baseStyles.bases.BASE_12,
      padding: baseStyles.bases.BASE_2,
    },
    accuracyBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    accuracyPayload: {
      paddingHorizontal: baseStyles.bases.BASE_2,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    accuracyPill: {
      width: baseStyles.bases.BASE_8,
      height: baseStyles.bases.BASE_4,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderLeftWidth: 0,
    },
    accuracyPillLast: {
      borderRadius: baseStyles.bases.BASE,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },

    accuracyPillFirst: {
      borderRadius: baseStyles.bases.BASE,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderLeftWidth: 1,
    },
    valuesContainer: {
      padding: baseStyles.bases.BASE_2,
    },
  });

export default styles;
