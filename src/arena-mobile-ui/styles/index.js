import {StyleSheet} from 'react-native';

import * as colors from '../colors';

const textStyle = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
  },
  bold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const card = StyleSheet.create({
  basicCard: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 8,
    borderColor: colors.neutralLight,
    backgroundColor: colors.white,
  },
});

export default {
  textStyle,
  card,
};
