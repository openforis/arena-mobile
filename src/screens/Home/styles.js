import {StyleSheet, Dimensions} from 'react-native';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('screen');

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    versionContainer: {
      width: WIDTH,
      justifyContent: 'center',
      flexDirection: 'row',
      paddingTop: baseStyles.bases.BASE,
    },
  });

export default styles;
