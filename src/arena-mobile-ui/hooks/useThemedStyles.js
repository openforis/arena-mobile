import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';

import * as colors from '../colors';
import {getBaseStyles} from '../styles';

const useColorTheme = () => {
  const _colorScheme = useSelector(appSelectors.getColorScheme);
  const colorScheme = useColorScheme();
  return _colorScheme || colorScheme;
};

const useThemedStyles = styles => {
  const colorScheme = useColorTheme();
  const baseModifier = useSelector(appSelectors.getBaseModifier);
  const fontBaseModifier = useSelector(appSelectors.getFontBaseModifier);

  return useMemo(() => {
    const themedColors = colors.themes[colorScheme] || {};
    const _colors = Object.assign({}, colors, themedColors);
    const _baseStyles = Object.assign(
      {},
      getBaseStyles({
        baseModifier,
        fontBaseModifier,
        colors: _colors,
      }),
    );
    return styles({colors: _colors, baseStyles: _baseStyles});
  }, [colorScheme, styles, fontBaseModifier, baseModifier]);
};

export default useThemedStyles;
