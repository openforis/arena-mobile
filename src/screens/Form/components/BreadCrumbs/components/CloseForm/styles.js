import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    entitySelectorButton: {
      margin: baseStyles.bases.BASE_2,
      padding: baseStyles.bases.BASE,
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: colors.neutralLightest,
    },
    numberOfErrorsContainer: {
      backgroundColor: colors.error,
      position: 'absolute',
      top: 0,
      right: 0,
      borderRadius: 100,
      paddingHorizontal: baseStyles.bases.BASE_2,
      minHeight: baseStyles.bases.BASE_6,
      minWidth: baseStyles.bases.BASE_6,
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
    },
  });

export default styles;
