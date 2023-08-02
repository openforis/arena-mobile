import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    title: {
      fontWeight: 'bold',
    },
    selectorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sliderContainer: {
      flex: 1,
      paddingHorizontal: baseStyles.bases.BASE_4,
    },
  });

export default styles;
