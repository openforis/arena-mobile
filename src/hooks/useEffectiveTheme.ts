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

const scaleFonts = (fontScale: any) => (fonts: any) => Object.entries(fonts).reduce((acc, [fontKey, font]) => {
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  const fontSizePrev = font.fontSize ?? defaultFontSize;
  const fontSize = Math.floor(fontSizePrev * fontScale);
  // @ts-expect-error TS(2698): Spread types may only be created from object types... Remove this comment to see the full error message
  const fontResized = { ...font, fontSize };
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2339): Property 'fonts' does not exist on type 'MD3Theme ... Remove this comment to see the full error message
    const { fonts } = theme;
    const fontsResized = scaleFonts(fontScale)(fonts);
    return { ...theme, fonts: fontsResized };
  }, [fontScale, themeSetting]);
};
