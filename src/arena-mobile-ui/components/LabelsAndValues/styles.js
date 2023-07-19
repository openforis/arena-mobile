import {StyleSheet} from 'react-native';

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      marginTop: baseStyles.bases.BASE,
      flexDirection: 'row',
      flex: 1,
    },
    labels: ({expanded}) => ({
      paddingRight: baseStyles.bases.BASE,
      ...(expanded ? {flex: 1} : {}),
    }),
    values: ({expanded}) => ({
      paddingRight: baseStyles.bases.BASE,
      ...(expanded
        ? {justifyContent: 'flex-end', alignItems: 'flex-end'}
        : {flex: 1}),
    }),

    color: {
      info: {
        color: colors.secondaryTextLight,
      },
      alert: {
        color: colors.alert,
      },
    },
  });

export default styles;
