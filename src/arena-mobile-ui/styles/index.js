import {StyleSheet} from 'react-native';

import * as colors from '../colors';

const textStyle = StyleSheet.create({
  title: {
    textTransform: 'capitalize',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    textTransform: 'capitalize',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    textTransform: 'capitalize',
    fontSize: 14,
  },
  bold: {
    textTransform: 'capitalize',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lower: {
    textTransform: 'lowercase',
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
