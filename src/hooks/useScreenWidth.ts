import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

import { SystemUtils } from "utils/SystemUtils";

export const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(SystemUtils.getScreenWidth());

  useEffect(() => {
    const handleChange = () => {
      setScreenWidth(SystemUtils.getScreenWidth());
    };
    const subscription = Dimensions.addEventListener("change", handleChange);
    return () => {
      subscription?.remove();
    };
  }, []);

  return screenWidth;
};
