import {StyleSheet} from 'react-native';

import * as colors from '../colors';

const BASE = 4;
const FONT_BASE = 4;

const fontSizes = {
  xxl: FONT_BASE * 6,
  xl: FONT_BASE * 5,
  l: FONT_BASE * 4,
  m: FONT_BASE * 3.5,
  s: FONT_BASE * 3,
  xs: FONT_BASE * 2,
};

const bases = {
  BASE, // 4
  BASE_2: BASE * 2, // 8
  BASE_3: BASE * 3, // 12
  BASE_4: BASE * 4, // 16
  BASE_6: BASE * 6, // 24
  BASE_8: BASE * 8, // 32
  BASE_16: BASE * 16, // 64
  BASE_24: BASE * 24, // 96
};
const textSize = StyleSheet.create({
  xxl: {
    fontSize: fontSizes.xxl,
  },
  xl: {
    fontSize: fontSizes.xl,
  },
  l: {
    fontSize: fontSizes.l,
  },
  m: {
    fontSize: fontSizes.m,
  },
  s: {
    fontSize: fontSizes.s,
  },
  xs: {
    fontSize: fontSizes.xs,
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
  bolder: {
    ...textSize.m,
    fontWeight: '900',
  },
  lower: {
    textTransform: 'lowercase',
  },
});

const card = StyleSheet.create({
  basicCard: {
    borderRadius: BASE,
    borderWidth: 1,
    padding: BASE * 2,
    borderColor: colors.neutralLight,
    backgroundColor: colors.white,
  },
  container: {
    borderRadius: 0,
    margin: 0,
    marginBottom: 0,
    paddingLeft: bases.BASE_2 + bases.BASE_3,
    paddingRight: bases.BASE_3,
    backgroundColor: colors.white,
    borderLeftColor: colors.transparent,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selected: {
    borderLeftWidth: bases.BASE_2,
    paddingLeft: bases.BASE_3,
    borderLeftColor: colors.secondary,
  },
});

export default {
  textStyle,
  textSize,
  card,
  fontSizes,
  BASE,
  bases,
};
