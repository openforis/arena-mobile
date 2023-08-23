import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: baseStyles.bases.BASE_4,
      paddingTop: 0,
      marginVertical: baseStyles.bases.BASE_4,
    },
    dividers: {
      height: 100,
    },

    buttonsContainer: {
      padding: baseStyles.bases.BASE_4,
    },
    exampleContainer: {
      padding: baseStyles.bases.BASE_2,
      paddingBottom: baseStyles.bases.BASE_6,

      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: baseStyles.bases.BASE_2,
      borderStyle: 'dashed',
      marginHorizontal: baseStyles.bases.BASE_4,
      marginVertical: baseStyles.bases.BASE_2,
      marginBottom: baseStyles.bases.BASE,
    },
    exampleTitle: {
      textAlign: 'center',
    },
    exampleDisclaimer: {
      textAlign: 'left',
    },
    optionContainer: {
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_4,
      borderBottomColor: colors.neutralLighter,
      borderBottomWidth: 0.5,
      flexDirection: 'row',
    },
    optionContainerFirst: {
      marginTop: baseStyles.bases.BASE_4,
      borderTopLeftRadius: baseStyles.bases.BASE_2,
      borderTopRightRadius: baseStyles.bases.BASE_2,
    },
    optionContainerLast: {
      borderBottomLeftRadius: baseStyles.bases.BASE_2,
      borderBottomRightRadius: baseStyles.bases.BASE_2,
      borderBottomWidth: 0,
    },
    optionContainerSelected: {
      backgroundColor: colors.secondaryLighter,
    },
    optionText: {
      marginLeft: baseStyles.bases.BASE_2,
    },
    optionTextSelected: {
      fontWeight: 'bold',
      color: colors.primaryContrastText,
    },
    showOneOptionPerVernacularNameSwitchContainer: {
      backgroundColor: colors.backgroundLight,
      padding: baseStyles.bases.BASE_4,
      borderBottomColor: colors.neutralLighter,
      borderBottomWidth: 0.5,
      flexDirection: 'row',
      borderRadius: baseStyles.bases.BASE_2,
      marginVertical: baseStyles.bases.BASE_4,
    },
  });

export default styles;
