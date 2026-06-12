import React from "react";
import {
  createStaticNavigation,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { adaptNavigationTheme, useTheme } from "react-native-paper";

import { log } from "utils";
import { screens } from "screens/screens";
import { CurrentSurveyCoordinator } from "./CurrentSurveyCoordinator";
import { AppBar } from "./AppBar";
import { screenKeys } from "screens/screenKeys";

const { LightTheme: NavLightThemeAdapted, DarkTheme: NavDarkThemeAdapted } =
  adaptNavigationTheme({
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
  });

const screenOptions = {
  header: (props: any) => React.createElement(AppBar, props),
};

const RootStack = createNativeStackNavigator({
  initialRouteName: screenKeys.home,
  screenOptions: screenOptions,
  screens: Object.entries(screens).reduce(
    (acc, [key, screen]) => {
      const { component, ...options } = screen;
      acc[key] = {
        screen: component,
        options,
      };
      return acc;
    },
    {} as Record<string, any>,
  ),
});

const Navigation = createStaticNavigation(RootStack);

export const AppStack = () => {
  log.debug(`rendering AppStack`);
  const theme = useTheme();
  const navTheme = theme.dark ? NavDarkThemeAdapted : NavLightThemeAdapted;
  return (
    <CurrentSurveyCoordinator>
      <Navigation theme={navTheme} />
    </CurrentSurveyCoordinator>
  );
};
