import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { DefaultTheme, MD3DarkTheme } from "react-native-paper";

import { Themes, ThemesSettings } from "model";
import { OFDarkTheme, OFLightTheme } from "theme";
import { SettingsSelectors } from "../state/settings/selectors";

const defaultFontSize = 16;

const ColorSchemeName = { dark: "dark", light: "light" };

const themeByThemeSetting = {
  [ThemesSettings.light]: OFLightTheme,
  [ThemesSettings.dark]: OFDarkTheme,
  [ThemesSettings.light2]: DefaultTheme,
  [ThemesSettings.dark2]: MD3DarkTheme,
};

const scaleFonts = (fontScale) => (fonts) =>
  Object.entries(fonts).reduce((acc, [fontKey, font]) => {
    const fontSizePrev = font.fontSize ?? defaultFontSize;
    const fontSize = Math.floor(fontSizePrev * fontScale);
    const fontResized = { ...font, fontSize };
    acc[fontKey] = fontResized;
    return acc;
  }, {});

export const useEffectiveTheme = () => {
  const colorScheme = useColorScheme();

  let {
    theme: themeSetting = ThemesSettings.auto,
    fontScale: settingsFontScale = 1,
  } = SettingsSelectors.useSettings();

  const fontScale = settingsFontScale <= 0 ? 1 : settingsFontScale;

  if (themeSetting === ThemesSettings.auto) {
    themeSetting =
      colorScheme === ColorSchemeName.dark ? Themes.dark : Themes.light;
  }
  return useMemo(() => {
    const theme = themeByThemeSetting[themeSetting];
    if (fontScale === 1) {
      return theme;
    }
    const { fonts } = theme;
    const fontsResized = scaleFonts(fontScale)(fonts);
    return { ...theme, fonts: fontsResized };
  }, [fontScale, themeSetting]);
};
