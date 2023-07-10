import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
  },
});

export const booleanOptionStyles =
  ({baseStyles, colors}) =>
  ({active}) =>
    StyleSheet.create({
      touchableContainer: {
        padding: baseStyles.bases.BASE_2,
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderColorSecondary,
        flexDirection: 'row',
        backgroundColor: active ? colors.secondary : colors.backgroundLight,
      },
      touchableLabel: {
        paddingLeft: baseStyles.bases.BASE,
        color: active ? colors.primaryContrastText : colors.secondary,
      },
    });

export default styles;
