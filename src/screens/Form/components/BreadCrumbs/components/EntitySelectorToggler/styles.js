import {StyleSheet} from 'react-native';

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    entitySelectorButton: {
      margin: baseStyles.bases.BASE_2,
      padding: baseStyles.bases.BASE,
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: colors.neutralLightest,
    },
  });

export default styles;
