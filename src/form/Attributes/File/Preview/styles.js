import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseStyles.bases.BASE / 2,
  },
  bottonContainer: {
    paddingHorizontal: baseStyles.bases.BASE_2,
    marginVertical: 0,
    flex: 1,
    marginHorizontal: baseStyles.bases.BASE,
  },
});

export default styles;
