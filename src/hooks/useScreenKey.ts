import { useNavigation } from "@react-navigation/native";

export const useScreenKey = () => {
  const navigation = useNavigation();
  const navigationState = navigation.getState();
  const { index, routes } = navigationState;
  return routes[index].name;
};
