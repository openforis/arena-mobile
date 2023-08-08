import {StyleSheet, Dimensions} from 'react-native';

const {width: WIDTH} = Dimensions.get('screen');

export const MaxPreviewSize = Math.min(WIDTH * 0.5, 250);

const styles = ({baseStyles, colors}) =>
  StyleSheet.create({
    container: {
      marginVertical: baseStyles.bases.BASE_4,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
    },
    imgContainer: {
      height: MaxPreviewSize,
      width: MaxPreviewSize,
      marginHorizontal: 'auto',
    },
    image: {
      flex: 1,
      backgroundColor: colors.neutralLightest,
    },
  });

export default styles;
