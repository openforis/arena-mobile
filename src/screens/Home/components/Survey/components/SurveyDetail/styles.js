import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      padding: baseStyles.bases.BASE_4,
      paddingBottom: baseStyles.bases.BASE_8,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
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
    headerLabelAndName: {
      paddingLeft: 8,
      flex: 1,
    },
    viewMoreContainer: {
      paddingBottom: baseStyles.bases.BASE_4,
    },
    viewMoreButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    divider: {
      marginVertical: baseStyles.bases.BASE_4,
    },
  });

export default styles;
