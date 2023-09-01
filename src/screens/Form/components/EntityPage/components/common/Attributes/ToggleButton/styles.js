import {StyleSheet, Dimensions} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const styles = ({baseStyles}) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: SCREEN_HEIGHT * 0.4,
      right: baseStyles.bases.BASE_3,
      zIndex: 100,
      borderRadius: baseStyles.bases.BASE,
      backgroundColor: baseStyles.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleButton: {
      padding: baseStyles.bases.BASE_2,
    },
  });

export default styles;
