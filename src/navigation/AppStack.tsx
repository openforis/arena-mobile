import React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { screens } from "screens/screens";
import { AppBar } from "./AppBar";
import { screenKeys } from "screens/screenKeys";

const screenOptions = { header: (props: any) => React.createElement(AppBar, props) };

// @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
const RootStack = createNativeStackNavigator({
  initialRouteName: screenKeys.home,
  screenOptions: screenOptions,
  screens: Object.entries(screens).reduce((acc, [key, screen]) => {
    const { component, ...options } = screen;
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    acc[key] = {
      screen: component,
      options,
    };
    return acc;
  }, {}),
});

const Navigation = createStaticNavigation(RootStack);

export const AppStack = () => {
  if (__DEV__) {
    console.log(`rendering AppStack`);
  }
  return <Navigation />;
};
