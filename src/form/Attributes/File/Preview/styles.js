import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: baseStyles.bases.BASE / 2,
  },
  buttonContainer: {
    paddingHorizontal: baseStyles.bases.BASE,
    marginVertical: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',

    marginHorizontal: baseStyles.bases.BASE,
    paddingVertical: baseStyles.bases.BASE,
  },
  previewThumbnail: {
    height: baseStyles.bases.BASE_14,
    width: baseStyles.bases.BASE_14,
    marginRight: baseStyles.bases.BASE_2,
    marginLeft: baseStyles.bases.BASE,
  },
  fileLabel: {
    padding: baseStyles.bases.BASE,
    marginRight: baseStyles.bases.BASE_2,
    maxWidth: '60%',
  },
});

export default styles;
