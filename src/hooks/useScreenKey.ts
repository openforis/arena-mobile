import { useNavigator } from "navigation/navigator";

export const useScreenKey = () => {
  const navigator = useNavigator();
  const { index, routes } = navigator.getState();
  return routes[index]!.name;
};
