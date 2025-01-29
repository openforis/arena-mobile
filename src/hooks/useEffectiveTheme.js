import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, DefaultTheme } from "react-native-paper";

import { Themes, ThemesSettings } from "model";
import { SettingsSelectors } from "../state/settings/selectors";

const defaultFontSize = 16;

export const useEffectiveTheme = () => {
  const colorScheme = useColorScheme();

  let { theme: themeSetting = ThemesSettings.auto, fontScale = 1 } =
    SettingsSelectors.useSettings();

  if (themeSetting === ThemesSettings.auto) {
    themeSetting = colorScheme === "dark" ? Themes.dark : Themes.light;
  }
  return useMemo(() => {
    const theme = themeSetting === Themes.dark ? MD3DarkTheme : DefaultTheme;
    const { fonts } = theme;
    const fontsResized = Object.entries(fonts).reduce(
      (acc, [fontKey, font]) => {
        const fontResized = {
          ...font,
          fontSize: Math.floor(font.fontSize ?? defaultFontSize * fontScale),
        };
        acc[fontKey] = fontResized;
        return acc;
      },
      {}
    );
    return { ...theme, fonts: fontsResized };
  }, [fontScale, themeSetting]);
};
