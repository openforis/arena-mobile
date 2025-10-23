import { useNavigation } from "@react-navigation/native";

export const useScreenKey = () => {
  const navigation = useNavigation();
  const navigationState = navigation.getState();
  // @ts-expect-error TS(2339): Property 'index' does not exist on type 'Readonly<... Remove this comment to see the full error message
  const { index, routes } = navigationState;
  return routes[index].name;
};
