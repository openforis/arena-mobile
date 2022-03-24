import {StyleSheet} from 'react-native';

import * as colors from '../colors';

const textSize = StyleSheet.create({
  xxl: {
    fontSize: 24,
  },
  xl: {
    fontSize: 18,
  },
  l: {
    fontSize: 16,
  },
  m: {
    fontSize: 14,
  },
  s: {
    fontSize: 12,
  },
  xs: {
    fontSize: 8,
  },
});

const textStyle = StyleSheet.create({
  title: {
    ...textSize.xxl,
    fontWeight: 'bold',
  },
  header: {
    ...textSize.xl,
    fontWeight: 'bold',
  },
  text: {
    ...textSize.m,
  },
  secondaryText: {
    ...textSize.m,
    color: colors.neutralLight,
  },
  bold: {
    ...textSize.m,
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
  textSize,
  card,
};
