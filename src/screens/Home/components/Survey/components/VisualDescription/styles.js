import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    initialsContainer: {
      justifyContent: 'flex-start',
    },
    initialsBox: {
      backgroundColor: colors.alertLightest,
      height: baseStyles.bases.BASE_16,
      width: baseStyles.bases.BASE_16,
      borderRadius: baseStyles.bases.BASE_2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initialsText: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: colors.primaryContrast,
    },
  });

export default styles;
