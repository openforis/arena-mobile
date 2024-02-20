import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      padding: baseStyles.bases.BASE_4,
      backgroundColor: colors.background,
    },
  });

export default styles;
