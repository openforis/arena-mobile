import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export const useNavigationEvent = (type, handler) => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.addListener(type, handler);
    return () => {
      navigation.removeListener(type, handler);
    };
  }, [handler, navigation, type]);
};
