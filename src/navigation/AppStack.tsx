import React, { useMemo } from "react";
import { DefaultTheme, createStaticNavigation } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useAppTheme } from "theme";
import { log, PreviewMode } from "utils";
import { screens } from "screens/screens";
import { CurrentSurveyCoordinator } from "./CurrentSurveyCoordinator";
import { AppBar, AppBarScreenOptions } from "./AppBar";
import { screenKeys } from "screens/screenKeys";

const screenOptions = {
  header: (props: NativeStackHeaderProps) => React.createElement(AppBar, props),
};

const RootStack = createNativeStackNavigator({
  // web preview: the previewed record is edited right away
  initialRouteName: PreviewMode.isActive
    ? screenKeys.recordEditor
    : screenKeys.home,
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
    {} as Record<
      string,
      {
        screen: React.ComponentType;
        options: NativeStackNavigationOptions & AppBarScreenOptions;
      }
    >,
  ),
});

const Navigation = createStaticNavigation(RootStack);

export const AppStack = () => {
  log.debug(`rendering AppStack`);

  const paperTheme = useAppTheme();

  // screen background comes from here now that View is transparent by default
  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: paperTheme.dark,
      colors: {
        ...DefaultTheme.colors,
        background: paperTheme.colors.background,
        card: paperTheme.colors.background,
      },
    }),
    [paperTheme],
  );

  return (
    <CurrentSurveyCoordinator>
      <Navigation theme={navigationTheme} />
    </CurrentSurveyCoordinator>
  );
};
