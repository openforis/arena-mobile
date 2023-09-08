import {StyleSheet} from 'react-native';

const styles = ({colors}) =>
  StyleSheet.create({
    validationReportHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    validationReportHeaderTextError: {
      color: colors.error,
    },
    colors,
  });

export default styles;
