import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { DefaultTheme, MD3DarkTheme } from "react-native-paper";

import { Themes, ThemesSettings } from "model";
import { OFDarkTheme, OFLightTheme } from "theme";
import { SettingsSelectors } from "../state/settings/selectors";

const defaultFontSize = 16;

const ColorSchemeName = {
  dark: "dark",
  light: "light",
};

const themeByThemeSetting = {
  [ThemesSettings.light]: OFLightTheme,
  [ThemesSettings.dark]: OFDarkTheme,
  [ThemesSettings.light2]: DefaultTheme,
  [ThemesSettings.dark2]: MD3DarkTheme,
};

const scaleFonts = (fontScale) => (fonts) => {
  if (fontScale === 1) return fonts;
  return Object.entries(fonts).reduce((acc, [fontKey, font]) => {
    const fontSize = Math.floor(font.fontSize ?? defaultFontSize * fontScale);
    const fontResized = { ...font, fontSize };
    acc[fontKey] = fontResized;
    return acc;
  }, {});
};

export const useEffectiveTheme = () => {
  const colorScheme = useColorScheme();

  let { theme: themeSetting = ThemesSettings.auto, fontScale = 1 } =
    SettingsSelectors.useSettings();

  if (themeSetting === ThemesSettings.auto) {
    themeSetting =
      colorScheme === ColorSchemeName.dark ? Themes.dark : Themes.light;
  }
  return useMemo(() => {
    const theme = themeByThemeSetting[themeSetting];
    const { fonts } = theme;
    const fontsResized = scaleFonts(fontScale)(fonts);
    return { ...theme, fonts: fontsResized };
  }, [fontScale, themeSetting]);
};
