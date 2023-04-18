import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
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
  example: {
    ...baseStyles.textStyle.header,
    textAlign: 'center',
  },
  optionContainer: {
    backgroundColor: colors.white,
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
  },
});

export default styles;
