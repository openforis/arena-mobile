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
      marginVertical: baseStyles.bases.BASE_6,
    },
    exampleTitle: {
      textAlign: 'center',
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
  });

export default styles;
