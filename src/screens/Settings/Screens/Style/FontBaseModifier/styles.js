import {StyleSheet} from 'react-native';

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      paddingTop: 0,
      marginVertical: 16,
    },
    title: {
      fontSize: 24,
    },
    info: {
      fontSize: 16,
    },
    sliderContainer: {
      paddingHorizontal: 16,
    },
    buttonsContainer: {
      padding: baseStyles.bases.BASE_4,
    },
    exampleContainer: {
      marginVertical: baseStyles.bases.BASE_6,
      padding: baseStyles.bases.BASE_4,
    },
  });

export default styles;
