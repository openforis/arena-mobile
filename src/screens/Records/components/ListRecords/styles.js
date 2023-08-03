import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    footer: {
      minHeight: 300,
      padding: baseStyles.bases.BASE_2,
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'column',
    },
  });

export default styles;
