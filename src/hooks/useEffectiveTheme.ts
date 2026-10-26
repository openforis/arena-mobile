import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { ThemesSettings } from "model";
import {
  AppTheme,
  AppThemeFonts,
  DefaultDarkTheme,
  DefaultLightTheme,
  OFDarkTheme,
  OFLightTheme,
} from "theme";
import { SettingsSelectors } from "../state/settings/selectors";

const defaultFontSize = 16;

const ColorSchemeName = { dark: "dark", light: "light" };

const themeByThemeSetting = {
  [ThemesSettings.light]: OFLightTheme,
  [ThemesSettings.dark]: OFDarkTheme,
  [ThemesSettings.light2]: DefaultLightTheme,
  [ThemesSettings.dark2]: DefaultDarkTheme,
};

const scaleFonts = (fontScale: number) => (fonts: AppThemeFonts) =>
  Object.entries(fonts).reduce((acc, [fontKey, font]) => {
    const fontSizePrev = (font as any).fontSize ?? defaultFontSize;
    const fontSize = Math.floor(fontSizePrev * fontScale);
    const fontResized = { ...font, fontSize };
    acc[fontKey] = fontResized;
    return acc;
  }, {} as any);

export const useEffectiveTheme = (): AppTheme => {
  const colorScheme = useColorScheme();

  let {
    theme: themeSetting = ThemesSettings.auto,
    fontScale: settingsFontScale = 1,
  } = SettingsSelectors.useSettings();

  const fontScale = settingsFontScale <= 0 ? 1 : settingsFontScale;

  if (themeSetting === ThemesSettings.auto) {
    themeSetting =
      colorScheme === ColorSchemeName.dark
        ? ThemesSettings.dark
        : ThemesSettings.light;
  }
  return useMemo(() => {
    const theme = themeByThemeSetting[themeSetting]!;
    if (fontScale === 1) {
      return theme;
    }
    const { fonts } = theme;
    const fontsResized = scaleFonts(fontScale)(fonts);
    return { ...theme, fonts: fontsResized } as AppTheme;
  }, [fontScale, themeSetting]);
};
