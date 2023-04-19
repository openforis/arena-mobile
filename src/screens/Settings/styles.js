import {StyleSheet} from 'react-native';

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
  sectionCardContainer: {
    backgroundColor: 'white',
    ...baseStyles.card.basicCard,
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
