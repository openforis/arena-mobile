import {StyleSheet} from 'react-native';

import inputStyles from '../Input/styles';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    inputContainer: {
      ...inputStyles({baseStyles, colors}).input,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: baseStyles.bases.BASE,
      paddingVertical: baseStyles.bases.BASE_2,
    },
    input: {
      flex: 1,
      fontSize: baseStyles.fontSizes.m,
      color: colors.primaryText,
    },
  });

export default styles;
