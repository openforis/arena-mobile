import React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { screens } from "screens/screens";
import { AppBar } from "./AppBar";
import { screenKeys } from "screens/screenKeys";

const screenOptions = { header: (props: any) => React.createElement(AppBar, props) };

const RootStack = createNativeStackNavigator({
  initialRouteName: screenKeys.home,
  screenOptions: screenOptions,
  screens: Object.entries(screens).reduce((acc, [key, screen]) => {
    const { component, ...options } = screen;
    acc[key] = {
      screen: component,
      options,
    };
    return acc;
  }, {} as Record<string, any>),
});

const Navigation = createStaticNavigation(RootStack);

export const AppStack = () => {
  if (__DEV__) {
    console.log(`rendering AppStack`);
  }
  return <Navigation />;
};
