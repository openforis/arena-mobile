import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: baseStyles.bases.BASE_4,
    paddingTop: 0,
    marginVertical: baseStyles.bases.BASE_4,
  },
  dividers: {
    height: 100,
  },
  textNameTitle: {
    paddingLeft: 16,
  },
  connectionSettingsContainer: {
    borderWidth: 0,
    flexDirection: 'row',
    padding: baseStyles.bases.BASE_4,
    justifyContent: 'space-between',
    paddingRight: 0,
  },
  connectionSettingsContainerIcon: {
    height: baseStyles.bases.BASE_16,
    width: baseStyles.bases.BASE_16,
    borderRadius: baseStyles.bases.BASE_16,
    backgroundColor: colors.alertLightest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionSettingsContainerIconText: {
    fontSize: baseStyles.bases.BASE_6,
    fontWeight: 'bold',
    color: colors.black,
  },
  connectionSettingsContainerText: {
    paddingHorizontal: baseStyles.bases.BASE_4,
    flexDirection: 'column',
    justifyContent: 'center',

    alignItems: 'flex-start',
    flex: 1,
  },
  sectionCardContainer: {
    borderWidth: 0,
    flexDirection: 'row',
    padding: baseStyles.bases.BASE_4,
    justifyContent: 'space-between',
    paddingRight: 0,
  },
  sectionCardContainerFirst: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sectionCardContainerLast: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  sectionCardContainerOnly: {
    borderRadius: 0,
  },

  iconContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCardTextContainer: {
    paddingHorizontal: baseStyles.bases.BASE_2,
    flexDirection: 'column',
    justifyContent: 'center',

    alignItems: 'flex-start',
    flex: 1,
  },
});

export default styles;
