import {StyleSheet, Dimensions} from 'react-native';
const {width: WIDTH, height: HEIGHT} = Dimensions.get('screen');
const styles = ({baseStyles}) =>
  StyleSheet.create({
    ...baseStyles.card,
    container: {
      ...baseStyles.card.container,
      flexDirection: 'column',
    },
    infoContainer: {
      flexDirection: 'row',
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: WIDTH * 0.7,
    },
    moreInfo: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignContent: 'flex-end',
    },
    payload: {
      flex: 1,
      flexDirection: 'row',
    },
    headder: {
      flexDirection: 'row',
    },
    visualDescriptionContainer: {
      paddingRight: baseStyles.bases.BASE,
    },
    activeSurveyContainer: {
      alignItems: 'flex-end',
    },
  });

export default styles;
