import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
    },
    entitySelectorButton: {
      backgroundColor: colors.primary,
    },
    breadCrumbsList: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    breadCrumbContainer: {
      height: '100%',
    },
  });

export default styles;
