import {StyleSheet, Dimensions} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';
import {ENTITY_SELECTOR_TABLET_WIDTH} from 'screens/Form/components/EntitySelector/component';
const {width: WIDTH} = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: WIDTH,
    backgroundColor: colors.white,
    bottom: 0,
    borderTopRightRadius: baseStyles.bases.BASE_4,
    borderTopLeftRadius: baseStyles.bases.BASE_4,
    paddingBottom: baseStyles.bases.BASE_8,
    borderColor: colors.neutralLighter,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    left: -1,
    minHeight: 120,
    flexDirection: 'column',
  },
  header: {
    marginTop: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
    padding: baseStyles.bases.BASE_4,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
    textAlign: 'left',
  },
  navigationBottom: {
    marginLeft: 0,
    marginBottom: 0,
    marginTop: baseStyles.bases.BASE,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerTextInfo: {
    ...baseStyles.textSize.s,
    color: colors.neutralLight,
    paddingBottom: baseStyles.bases.BASE,
    textAlign: 'left',
  },
  headerText: {
    ...baseStyles.textSize.l,
    textAlign: 'left',
    color: colors.neutralDark,
    marginRight: 8,
  },
  optionsContainer: {
    padding: baseStyles.bases.BASE_4,
    backgroundColor: colors.white,
    flexDirection: 'row',
  },
  containerTabletMenuOpen: {
    width: WIDTH - ENTITY_SELECTOR_TABLET_WIDTH,
  },
  button: {
    borderRadius: baseStyles.bases.BASE,
    backgroundColor: colors.neutralLightest,
    padding: baseStyles.bases.BASE_2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
});

export default styles;
