import React, { useMemo } from "react";
import { DefaultTheme, createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";

import { log } from "utils";
import { screens } from "screens/screens";
import { CurrentSurveyCoordinator } from "./CurrentSurveyCoordinator";
import { AppBar } from "./AppBar";
import { screenKeys } from "screens/screenKeys";

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

  const paperTheme = useTheme();

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
