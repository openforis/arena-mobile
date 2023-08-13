import {StyleSheet} from 'react-native';

import * as _colors from '../colors';

// 0.75 1 1.25
export const _BASE = 4;
// 1, 1.25, 1.5
export const _FONT_BASE = 4;

export const baseRanges = [0.75, 0.9, 1, 1.1, 1.25, 1.35];
export const fontRanges = [0.8, 1, 1.1, 1.25, 1.3, 1.5];

export const _getFontStyles = ({fontBase, colors}) => {
  const fontSizes = {
    xxl: fontBase * 6,
    xl: fontBase * 5,
    l: fontBase * 4,
    m: fontBase * 3.5,
    s: fontBase * 3,
    xs: fontBase * 2,
  };

  const iconSizes = {
    xxl: fontBase * 10,
    xl: fontBase * 9,
    l: fontBase * 8,
    m: fontBase * 6,
    s: fontBase * 4,
    xs: fontBase * 2,
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
      color: colors.primaryText,
      fontWeight: 'bold',
    },
    header: {
      ...textSize.xl,
      color: colors.primaryText,
      fontWeight: 'bold',
    },
    text: {
      ...textSize.m,
      color: colors.primaryText,
    },
    primary: {
      ...textSize.m,
      color: colors.primaryText,
    },
    secondary: {
      ...textSize.m,
      color: colors.secondaryText,
    },
    secondaryLight: {
      ...textSize.m,
      color: colors.secondaryTextLight,
    },
    bold: {
      ...textSize.m,
      color: colors.primaryText,
      fontWeight: 'bold',
    },
    bolder: {
      ...textSize.m,
      color: colors.primaryText,
      fontWeight: '900',
    },
    lower: {
      color: colors.primaryText,
      textTransform: 'lowercase',
    },
  });

  return {
    fontSizes,
    iconSizes,
    textSize,
    textStyle,
    defaultFontSize: fontSizes.m,
    defaultIconSize: iconSizes.m,
  };
};
export const getBaseStyles = ({
  baseModifier = 1,
  fontBaseModifier = 1,
  colors = _colors,
} = {}) => {
  const BASE = _BASE * baseModifier;
  const FONT_BASE = _FONT_BASE * fontBaseModifier;

  const {fontSizes, iconSizes, textSize, textStyle} = _getFontStyles({
    fontBase: FONT_BASE,
    colors,
  });

  const bases = {
    BASE, // 4
    BASE_2: BASE * 2, // 8
    BASE_3: BASE * 3, // 12
    BASE_4: BASE * 4, // 16
    BASE_5: BASE * 5, // 20
    BASE_6: BASE * 6, // 24
    BASE_8: BASE * 8, // 32
    BASE_12: BASE * 12, // 48
    BASE_14: BASE * 16, // 56
    BASE_16: BASE * 16, // 64
    BASE_24: BASE * 24, // 96
  };

  const card = StyleSheet.create({
    basicCard: {
      borderRadius: BASE,
      borderWidth: 1,
      padding: BASE * 2,
      borderColor: colors.neutralLight,
      backgroundColor: colors.backgroundLight,
    },
    container: {
      borderRadius: 0,
      margin: 0,
      marginBottom: 0,
      paddingLeft: bases.BASE_2 + bases.BASE_3,
      paddingRight: bases.BASE_3,
      backgroundColor: colors.backgroundLight,
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

  return {
    textStyle,
    textSize,
    iconSizes,
    card,
    fontSizes,
    BASE,
    bases,
    colors,
    FONT_BASE,
  };
};

const baseStyles = getBaseStyles();

export default baseStyles;
