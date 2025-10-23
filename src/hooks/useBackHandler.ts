import { useEffect } from "react";
import { BackHandler } from "react-native";

export const useBackHandler = (onBack) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBack
    );
    return () => backHandler.remove();
  }, [onBack]);
};
