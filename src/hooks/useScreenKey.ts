import { useContext } from "react";
import { NavigationRouteContext } from "@react-navigation/native";

import { useNavigator } from "navigation/navigator";

export const useScreenKey = () => {
  // the screen the caller belongs to, not the focused one (screens below the top of the stack stay mounted)
  const route = useContext(NavigationRouteContext);
  const navigator = useNavigator();
  if (route) return route.name;
  const { index, routes } = navigator.getState();
  return routes[index]!.name;
};
