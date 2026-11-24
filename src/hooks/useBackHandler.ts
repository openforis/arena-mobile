import { useEffect } from "react";
import { BackHandler } from "react-native";

export const useBackHandler = (
  onBack: Parameters<typeof BackHandler.addEventListener>[1],
) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBack,
    );
    return () => backHandler.remove();
  }, [onBack]);
};
