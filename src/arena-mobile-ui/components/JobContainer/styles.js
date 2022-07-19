import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('screen');
import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  jobContainer: {
    position: 'relative',
    backgroundColor: colors.translucidLight,
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    zIndex: 1,

    backgroundColor: colors.white,

    width: width - (baseStyles.bases.BASE_3 * 2 - 2),
    left: baseStyles.bases.BASE_3,
    top: baseStyles.bases.BASE_3,
    borderRadius: baseStyles.bases.BASE_2,
    borderWidth: 1,
    borderColor: colors.neutralLighter,
  },
  scrollContainer: {
    padding: baseStyles.bases.BASE_3,
    paddingTop: baseStyles.bases.BASE_3,
    paddingBottom: baseStyles.bases.BASE_8,
  },
  closeButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: baseStyles.bases.BASE_4,
  },
});

export default styles;
